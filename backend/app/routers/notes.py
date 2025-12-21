from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import uuid4
import os

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Folder, Note, Tag, User, NoteShare
from ..core.config import settings
from ..core.storage import upload_image_to_s3

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


async def _purge_deleted(session: AsyncSession):
    """Xóa hẳn các ghi chú đã trong thùng rác > 30 ngày"""
    threshold = datetime.utcnow() - timedelta(days=30)
    await session.execute(delete(Note).where(Note.deleted_at.is_not(None), Note.deleted_at < threshold))
    await session.commit()


@router.get("", response_model=List[schemas.NoteOut])
async def list_notes(
    folder_id: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    await _purge_deleted(session)
    
    query = (
        select(Note)
        .where(Note.user_id == current_user.id)
        .where(Note.deleted_at.is_(None))
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    
    if folder_id is not None:
        query = query.where(Note.folder_id == folder_id)
    
    result = await session.execute(query)
    user_notes = result.scalars().all()
    
    shared_query = (
        select(Note)
        .join(NoteShare, NoteShare.note_id == Note.id)
        .where(
            NoteShare.shared_with_user_id == current_user.id,
            NoteShare.status == "accepted",
            Note.deleted_at.is_(None)
        )
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    
    if folder_id is not None:
        shared_query = shared_query.where(Note.folder_id == folder_id)
    
    shared_result = await session.execute(shared_query)
    shared_notes = shared_result.scalars().all()
    
    all_notes = list(user_notes)
    note_ids = {note.id for note in user_notes}
    for note in shared_notes:
        if note.id not in note_ids:
            all_notes.append(note)
    
    all_notes.sort(key=lambda n: (not n.is_pinned, n.updated_at), reverse=True)
    
    return all_notes


@router.get("/trash", response_model=List[schemas.NoteOut])
async def list_trash(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    await _purge_deleted(session)
    result = await session.execute(
        select(Note)
        .where(Note.user_id == current_user.id)
        .where(Note.deleted_at.is_not(None))
        .options(selectinload(Note.tags), selectinload(Note.folder))
        .order_by(Note.deleted_at.desc())
    )
    return result.scalars().all()


@router.get("/{note_id}", response_model=schemas.NoteOut)
async def get_note(
    note_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Note)
        .where(Note.id == note_id, Note.user_id == current_user.id, Note.deleted_at.is_(None))
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
        reminder_at=note_in.reminder_at,
        reminder_sent=False,  # Mặc định chưa gửi email nhắc nhở
        is_pinned=note_in.is_pinned,
        tags=tags,
        color=note_in.color or "#ffffff",
        image_url=note_in.image_url,
    )
    session.add(note)
    await session.commit()
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
    if not note or note.user_id != current_user.id or note.deleted_at is not None:
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
    if note_in.reminder_at is not None:
        note.reminder_at = note_in.reminder_at
        note.reminder_sent = False if note_in.reminder_at else False
    if note_in.is_pinned is not None:
        note.is_pinned = note_in.is_pinned
    if note_in.color is not None:
        note.color = note_in.color
    if note_in.image_url is not None:
        note.image_url = note_in.image_url
    if note_in.tag_ids is not None:
        note.tags = await _load_tags(session, current_user.id, note_in.tag_ids)

    session.add(note)
    await session.commit()
    result = await session.execute(
        select(Note)
        .where(Note.id == note.id)
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    return result.scalar_one()


@router.delete("/{note_id}", status_code=status.HTTP_200_OK)
async def delete_note(
    note_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = await session.get(Note, note_id, options=[selectinload(Note.tags)])
    if not note or note.user_id != current_user.id or note.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Note not found")

    note.deleted_at = datetime.utcnow()
    session.add(note)
    await session.commit()
    return JSONResponse({"message": "Note moved to trash"}, status_code=status.HTTP_200_OK)


@router.post("/{note_id}/restore", response_model=schemas.NoteOut)
async def restore_note(
    note_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = await session.get(Note, note_id, options=[selectinload(Note.tags)])
    if not note or note.user_id != current_user.id or note.deleted_at is None:
        raise HTTPException(status_code=404, detail="Note not found")
    note.deleted_at = None
    session.add(note)
    await session.commit()
    result = await session.execute(
        select(Note)
        .where(Note.id == note.id)
        .options(selectinload(Note.tags), selectinload(Note.folder))
    )
    return result.scalar_one()


@router.delete("/{note_id}/force", status_code=status.HTTP_204_NO_CONTENT)
async def force_delete_note(
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


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Chỉ cho phép tải lên ảnh")

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid4().hex}{ext}"

    if settings.s3_enabled:
        try:
            url = await upload_image_to_s3(file, filename, file.content_type)
            return {"url": url}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Upload S3 thất bại: {exc}")

    _current_file = os.path.abspath(__file__)
    _routers_dir = os.path.dirname(_current_file)  # Thư mục routers/
    _app_dir = os.path.dirname(_routers_dir)  # Thư mục app/
    _backend_dir = os.path.dirname(_app_dir)  # Thư mục backend/
    _project_root = os.path.dirname(_backend_dir)  # Thư mục gốc
    uploads_dir = os.path.join(_backend_dir, "uploads")
    if not os.path.exists(uploads_dir):
        uploads_dir = os.path.join(_project_root, "backend", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    import aiofiles

    file_path = os.path.join(uploads_dir, filename)
    async with aiofiles.open(file_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            await f.write(chunk)

    return {"url": f"/uploads/{filename}"}

