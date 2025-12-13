from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Tag, User

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[schemas.TagOut])
async def list_tags(session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)):
    result = await session.execute(select(Tag).where(Tag.user_id == current_user.id))
    return result.scalars().all()


@router.post("", response_model=schemas.TagOut, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_in: schemas.TagCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    existing = await session.execute(select(Tag).where(Tag.name == tag_in.name, Tag.user_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tag already exists")

    tag = Tag(name=tag_in.name, user_id=current_user.id)
    session.add(tag)
    await session.commit()
    await session.refresh(tag)
    return tag

