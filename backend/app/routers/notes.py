from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Folder, Note, Tag, User

router = APIRouter(prefix="/notes", tags=["notes"])


async def _ensure_folder(session: AsyncSession, user_id: int, folder_id: Optional[int]) -> Optional[Folder]:
    if folder_id is None:
        return None
    folder = await session.get(Folder, folder_id)
    if not folder or folder.user_id != user_id:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder


async def _load_tags(session: AsyncSession, user_id: int, tag_ids: List[int]) -> List[Tag]:
    if not tag_ids:
        return []
    result = await session.execute(select(Tag).where(Tag.id.in_(tag_ids), Tag.user_id == user_id))
    tags = result.scalars().all()
    if len(tags) != len(set(tag_ids)):
        raise HTTPException(status_code=404, detail="Some tags not found")
    return tags


@router.get("", response_model=List[schemas.NoteOut])
async def list_notes(
    folder_id: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Note)
        .where(Note.user_id == current_user.id)
        .options(selectinload(Note.tags), selectinload(Note.folder))
        .order_by(Note.updated_at.desc())
    )
    if folder_id is not None:
        query = query.where(Note.folder_id == folder_id)
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{note_id}", response_model=schemas.NoteOut)
async def get_note(
    note_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Note)
        .where(Note.id == note_id, Note.user_id == current_user.id)
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post("", response_model=schemas.NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: schemas.NoteCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    await _ensure_folder(session, current_user.id, note_in.folder_id)
    tags = await _load_tags(session, current_user.id, note_in.tag_ids)

    note = Note(
        title=note_in.title,
        content=note_in.content,
        is_markdown=note_in.is_markdown,
        folder_id=note_in.folder_id,
        user_id=current_user.id,
        is_public=note_in.is_public,
        tags=tags,
    )
    session.add(note)
    await session.commit()
    # Reload with relationships to avoid lazy load in response (async safe)
    result = await session.execute(
        select(Note)
        .where(Note.id == note.id)
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    return result.scalar_one()


@router.patch("/{note_id}", response_model=schemas.NoteOut)
async def update_note(
    note_id: int,
    note_in: schemas.NoteUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = await session.get(Note, note_id, options=[selectinload(Note.tags)])
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    if note_in.folder_id is not None:
        await _ensure_folder(session, current_user.id, note_in.folder_id)
        note.folder_id = note_in.folder_id
    if note_in.title is not None:
        note.title = note_in.title
    if note_in.content is not None:
        note.content = note_in.content
    if note_in.is_markdown is not None:
        note.is_markdown = note_in.is_markdown
    if note_in.is_public is not None:
        note.is_public = note_in.is_public
    if note_in.tag_ids is not None:
        note.tags = await _load_tags(session, current_user.id, note_in.tag_ids)

    session.add(note)
    await session.commit()
    # Reload with relationships to avoid lazy load in response (async safe)
    result = await session.execute(
        select(Note)
        .where(Note.id == note.id)
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    return result.scalar_one()


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = await session.get(Note, note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    await session.delete(note)
    await session.commit()
    return None

