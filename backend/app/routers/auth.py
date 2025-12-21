from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from .. import schemas
from ..core import security
from ..core.config import settings
from ..core.email import send_welcome_email
from ..database import get_session
from ..deps import get_current_user
from ..models import User

router = APIRouter(prefix="/auth", tags=["auth"])


# dang ky
@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: schemas.UserCreate, session: AsyncSession = Depends(get_session)):
    existing_email = await session.execute(select(User).where(User.email == user_in.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await session.execute(select(User).where(User.username == user_in.username))
    if existing_username.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password)
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Gửi email chào mừng (không block nếu lỗi)
    try:
        await send_welcome_email(user.email, user.username)
    except Exception as e:
        # Log lỗi nhưng không làm fail đăng ký
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Không thể gửi email chào mừng: {str(e)}")
    
    return user


# dang nhap
@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(User).where(
            or_(User.email == form_data.username, User.username == form_data.username)
        )
    )
    user = result.scalar_one_or_none()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    token = security.create_access_token(subject=user.email, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer"}


# lay thong tin user hien tai
@router.get("/me", response_model=schemas.UserOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

