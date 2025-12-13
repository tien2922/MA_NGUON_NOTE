from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Folder, User

router = APIRouter(prefix="/folders", tags=["folders"])


@router.get("", response_model=List[schemas.FolderOut])
async def list_folders(session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(select(Folder).where(Folder.user_id == current_user.id))
    return result.scalars().all()


@router.post("", response_model=schemas.FolderOut, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_in: schemas.FolderCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if folder_in.parent_id:
        parent = await session.get(Folder, folder_in.parent_id)
        if not parent or parent.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Parent folder not found")

    folder = Folder(name=folder_in.name, parent_id=folder_in.parent_id, user_id=current_user.id)
    session.add(folder)
    await session.commit()
    await session.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    folder = await session.get(Folder, folder_id)
    if not folder or folder.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Folder not found")

    await session.delete(folder)
    await session.commit()
    return None

