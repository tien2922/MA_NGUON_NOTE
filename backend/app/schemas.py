from datetime import datetime, timedelta
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class FolderBase(BaseModel):
    name: str
    parent_id: Optional[int] = None


class FolderCreate(FolderBase):
    pass


class FolderOut(FolderBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class TagOut(TagBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class NoteBase(BaseModel):
    title: str
    content: str = ""
    is_markdown: bool = True
    folder_id: Optional[int] = None
    tag_ids: List[int] = Field(default_factory=list)
    is_public: bool = False
    color: Optional[str] = None
    image_url: Optional[str] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_markdown: Optional[bool] = None
    folder_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    is_public: Optional[bool] = None
    color: Optional[str] = None
    image_url: Optional[str] = None


class NoteOut(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagOut] = Field(default_factory=list)
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SearchResult(BaseModel):
    notes: List[NoteOut]


class ShareLinkCreate(BaseModel):
    expires_in_minutes: Optional[int] = Field(default=None, ge=5, le=60 * 24 * 30)
    is_public: bool = True


class ShareLinkOut(BaseModel):
    token: str
    expires_at: Optional[datetime]
    url: str

