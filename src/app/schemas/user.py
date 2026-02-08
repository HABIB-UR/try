from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None

class UserInDB(UserBase):
    id: uuid.UUID
    hashed_password: str
    created_at: datetime
    updated_at: datetime

class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None