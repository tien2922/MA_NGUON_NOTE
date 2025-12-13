from datetime import datetime, timedelta, timezone
from typing import List
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Note, ShareLink, User, NoteShare

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


@router.get("/public/{token}", response_model=schemas.PublicNoteOut)
async def read_shared_note(
    token: str,
    session: AsyncSession = Depends(get_session),
):
    """Đọc ghi chú qua share token công khai"""
    result = await session.execute(
        select(ShareLink)
        .where(ShareLink.token == token)
        .options(selectinload(ShareLink.note).selectinload(Note.tags))
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Share link not found")

    if link.expires_at and link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Share link expired")

    note = link.note
    if not note or note.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Note not available")
    if not link.is_public:
        raise HTTPException(status_code=403, detail="This link is private")

    return schemas.PublicNoteOut(
        id=note.id,
        title=note.title,
        content=note.content,
        is_markdown=note.is_markdown,
        color=note.color,
        image_url=note.image_url,
        reminder_at=note.reminder_at,
        is_public=note.is_public,
        created_at=note.created_at,
        updated_at=note.updated_at,
        tags=note.tags,
    )


@router.post("/notes/{note_id}/user", response_model=schemas.ShareRequestOut, status_code=status.HTTP_201_CREATED)
async def share_note_with_user(
    note_id: int,
    payload: schemas.ShareNoteRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Share note với một user cụ thể bằng username"""
    note = await session.get(Note, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.deleted_at:
        raise HTTPException(status_code=400, detail="Cannot share deleted note")
    
    result = await session.execute(
        select(User).where(User.username == payload.username)
    )
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share note with yourself")
    
    existing = await session.execute(
        select(NoteShare).where(
            NoteShare.note_id == note_id,
            NoteShare.shared_with_user_id == target_user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Note already shared with this user")
    
    share = NoteShare(
        note_id=note_id,
        shared_by_user_id=current_user.id,
        shared_with_user_id=target_user.id,
        status="pending"
    )
    session.add(share)
    await session.commit()
    await session.refresh(share, ["note", "shared_by"])
    
    return schemas.ShareRequestOut(
        id=share.id,
        note_id=share.note_id,
        note_title=note.title,
        shared_by_user_id=share.shared_by_user_id,
        shared_by_username=current_user.username,
        shared_with_user_id=share.shared_with_user_id,
        status=share.status,
        created_at=share.created_at,
        responded_at=share.responded_at
    )


@router.get("/requests/pending", response_model=List[schemas.ShareRequestOut])
async def get_pending_shares(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Lấy danh sách share requests đang chờ (nhận được)"""
    result = await session.execute(
        select(NoteShare)
        .where(
            NoteShare.shared_with_user_id == current_user.id,
            NoteShare.status == "pending"
        )
        .options(
            selectinload(NoteShare.note),
            selectinload(NoteShare.shared_by)
        )
        .order_by(NoteShare.created_at.desc())
    )
    shares = result.scalars().all()
    
    return [
        schemas.ShareRequestOut(
            id=share.id,
            note_id=share.note_id,
            note_title=share.note.title,
            shared_by_user_id=share.shared_by_user_id,
            shared_by_username=share.shared_by.username,
            shared_with_user_id=share.shared_with_user_id,
            status=share.status,
            created_at=share.created_at,
            responded_at=share.responded_at
        )
        for share in shares
    ]


@router.post("/requests/{share_id}/accept", response_model=schemas.ShareRequestOut)
async def accept_share(
    share_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Chấp nhận share request"""
    share = await session.get(NoteShare, share_id)
    if not share:
        raise HTTPException(status_code=404, detail="Share request not found")
    
    if share.shared_with_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if share.status != "pending":
        raise HTTPException(status_code=400, detail="Share request already processed")
    
    share.status = "accepted"
    share.responded_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(share, ["note", "shared_by"])
    
    return schemas.ShareRequestOut(
        id=share.id,
        note_id=share.note_id,
        note_title=share.note.title,
        shared_by_user_id=share.shared_by_user_id,
        shared_by_username=share.shared_by.username,
        shared_with_user_id=share.shared_with_user_id,
        status=share.status,
        created_at=share.created_at,
        responded_at=share.responded_at
    )


@router.post("/requests/{share_id}/reject", response_model=schemas.ShareRequestOut)
async def reject_share(
    share_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Từ chối share request"""
    share = await session.get(NoteShare, share_id)
    if not share:
        raise HTTPException(status_code=404, detail="Share request not found")
    
    if share.shared_with_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if share.status != "pending":
        raise HTTPException(status_code=400, detail="Share request already processed")
    
    share.status = "rejected"
    share.responded_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(share, ["note", "shared_by"])
    
    return schemas.ShareRequestOut(
        id=share.id,
        note_id=share.note_id,
        note_title=share.note.title,
        shared_by_user_id=share.shared_by_user_id,
        shared_by_username=share.shared_by.username,
        shared_with_user_id=share.shared_with_user_id,
        status=share.status,
        created_at=share.created_at,
        responded_at=share.responded_at
    )

