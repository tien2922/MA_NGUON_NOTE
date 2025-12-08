from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import schemas
from ..database import get_session
from ..deps import get_current_user
from ..models import Note, User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=List[schemas.NoteOut])
async def search_notes(
    q: str = Query(..., min_length=2),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Note)
        .where(Note.user_id == current_user.id)
        .where(Note.search_vector.match(q, postgresql_regconfig="english"))
        .options(selectinload(Note.tags))
        .order_by(Note.updated_at.desc())
        .limit(50)
    )
    result = await session.execute(query)
    return result.scalars().all()

