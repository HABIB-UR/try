from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..auth import get_current_user
from ..models.user import User
from ..models.todo import Todo, TodoCreate, TodoUpdate, TodoRead
from ..schemas.todo import TodoPublic, TodoToggleComplete
import uuid

router = APIRouter()

@router.get("/", response_model=List[TodoPublic])
def get_todos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Todo).where(Todo.user_id == current_user.id)
    todos = session.exec(statement).all()
    return [
        TodoPublic(
            id=todo.id,
            title=todo.title,
            description=todo.description,
            completed=todo.completed,
            due_date=todo.due_date,
            user_id=todo.user_id,
            created_at=todo.created_at,
            updated_at=todo.updated_at
        )
        for todo in todos
    ]


@router.post("/", response_model=TodoPublic)
def create_todo(
    todo: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        due_date=todo.due_date,
        user_id=current_user.id
    )

    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)

    return TodoPublic(
        id=db_todo.id,
        title=db_todo.title,
        description=db_todo.description,
        completed=db_todo.completed,
        due_date=db_todo.due_date,
        user_id=db_todo.user_id,
        created_at=db_todo.created_at,
        updated_at=db_todo.updated_at
    )


@router.put("/{id}", response_model=TodoPublic)
def update_todo(
    id: uuid.UUID,
    todo_update: TodoUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    db_todo = session.exec(statement).first()

    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or not owned by user"
        )

    # Update fields that were provided
    update_data = todo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)

    # No need to call session.add() - object is already tracked by session
    session.commit()
    session.refresh(db_todo)

    return TodoPublic(
        id=db_todo.id,
        title=db_todo.title,
        description=db_todo.description,
        completed=db_todo.completed,
        due_date=db_todo.due_date,
        user_id=db_todo.user_id,
        created_at=db_todo.created_at,
        updated_at=db_todo.updated_at
    )


@router.delete("/{id}")
def delete_todo(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    db_todo = session.exec(statement).first()

    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or not owned by user"
        )

    session.delete(db_todo)
    session.commit()

    return {"message": "Todo deleted successfully"}


@router.patch("/{id}/complete", response_model=TodoPublic)
def toggle_todo_completion(
    id: uuid.UUID,
    completion_data: TodoToggleComplete,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    db_todo = session.exec(statement).first()

    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or not owned by user"
        )

    db_todo.completed = completion_data.completed

    # No need to call session.add() - object is already tracked by session
    session.commit()
    session.refresh(db_todo)

    return TodoPublic(
        id=db_todo.id,
        title=db_todo.title,
        description=db_todo.description,
        completed=db_todo.completed,
        due_date=db_todo.due_date,
        user_id=db_todo.user_id,
        created_at=db_todo.created_at,
        updated_at=db_todo.updated_at
    )