from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Note, ShareLink, User

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/notes/{note_id}", response_model=schemas.ShareLinkOut, status_code=status.HTTP_201_CREATED)
async def create_share_link(
    note_id: int,
    payload: schemas.ShareLinkCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = await session.get(Note, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    expires_at = None
    if payload.expires_in_minutes:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=payload.expires_in_minutes)

    token = secrets.token_urlsafe(16)
    link = ShareLink(note_id=note.id, token=token, expires_at=expires_at, is_public=payload.is_public)
    session.add(link)
    await session.commit()
    await session.refresh(link)

    url = str(request.base_url)[:-1] + request.url_for("read_shared_note", token=token).path
    return schemas.ShareLinkOut(token=token, expires_at=expires_at, url=url)


@router.get("/{token}", response_model=schemas.NoteOut, name="read_shared_note")
async def read_shared_note(token: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(ShareLink)
        .where(ShareLink.token == token)
        .options(selectinload(ShareLink.note).selectinload(Note.tags))
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    if link.expires_at and link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Link expired")

    if not link.is_public and not link.note.is_public:
        raise HTTPException(status_code=403, detail="Link is not public")

    return link.note

