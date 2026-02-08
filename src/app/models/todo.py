from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Index
from typing import Optional
from datetime import datetime
import uuid
from .user import User

class TodoBase(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = Field(default=False)
    due_date: Optional[datetime] = None

class Todo(TodoBase, table=True):
    """Todo model with indexes optimized for serverless query patterns.

    Indexes:
    - ix_todo_user_id: Single column index for user_id lookups
    - ix_todo_user_completed: Composite index for filtering by user and completion status
    """
    __table_args__ = (
        Index("ix_todo_user_id", "user_id"),
        Index("ix_todo_user_completed", "user_id", "completed"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: "User" = Relationship(back_populates="todos")

class TodoCreate(TodoBase):
    pass

class TodoUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None

class TodoRead(TodoBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime