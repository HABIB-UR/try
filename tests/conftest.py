"""
Pytest fixtures for Todo API backend tests.

This module provides shared test fixtures including:
- SQLite in-memory test database setup
- FastAPI TestClient configuration
- Test user creation helpers
- JWT token generation helpers
"""

import pytest
import uuid
from datetime import datetime, timedelta
from typing import Generator, Dict, Any

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from src.app.main import app
from src.app.database import get_session
from src.app.auth import get_password_hash, create_access_token
from src.app.models.user import User
from src.app.models.todo import Todo


# Test database engine using SQLite in-memory
TEST_DATABASE_URL = "sqlite://"


@pytest.fixture(name="engine")
def engine_fixture():
    """
    Create a test database engine using SQLite in-memory.

    This fixture creates a fresh in-memory SQLite database for each test,
    ensuring test isolation and preventing state leakage between tests.

    Yields:
        Engine: SQLAlchemy engine connected to in-memory SQLite database
    """
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    # Cleanup is automatic with in-memory database


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session, None, None]:
    """
    Create a test database session.

    This fixture provides a database session connected to the test database.
    The session is automatically closed after the test completes.

    Args:
        engine: Test database engine fixture

    Yields:
        Session: SQLModel session for database operations
    """
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """
    Create a FastAPI test client with database dependency override.

    This fixture configures the FastAPI TestClient to use the test database
    session instead of the production database, ensuring test isolation.

    Args:
        session: Test database session fixture

    Yields:
        TestClient: FastAPI test client configured for testing
    """
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override

    with TestClient(app) as client:
        yield client

    # Clean up dependency overrides after test
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session) -> User:
    """
    Create a test user in the database.

    This fixture creates a standard test user with known credentials
    for use in authentication and authorization tests.

    Args:
        session: Test database session fixture

    Returns:
        User: Created test user with email "test@example.com"
    """
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="second_test_user")
def second_test_user_fixture(session: Session) -> User:
    """
    Create a second test user for multi-user test scenarios.

    This fixture creates an additional test user to verify that users
    cannot access each other's data.

    Args:
        session: Test database session fixture

    Returns:
        User: Created test user with email "other@example.com"
    """
    user = User(
        id=uuid.uuid4(),
        email="other@example.com",
        hashed_password=get_password_hash("otherpassword123"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_token")
def auth_token_fixture(test_user: User) -> str:
    """
    Generate a valid JWT token for the test user.

    This fixture creates a JWT access token for the test user,
    suitable for authenticating API requests in tests.

    Args:
        test_user: Test user fixture

    Returns:
        str: JWT access token for the test user
    """
    return create_access_token(
        data={"sub": test_user.email},
        expires_delta=timedelta(minutes=30)
    )


@pytest.fixture(name="second_auth_token")
def second_auth_token_fixture(second_test_user: User) -> str:
    """
    Generate a valid JWT token for the second test user.

    Args:
        second_test_user: Second test user fixture

    Returns:
        str: JWT access token for the second test user
    """
    return create_access_token(
        data={"sub": second_test_user.email},
        expires_delta=timedelta(minutes=30)
    )


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(auth_token: str) -> Dict[str, str]:
    """
    Create authorization headers with the test user's JWT token.

    This fixture provides ready-to-use HTTP headers for authenticated
    requests in tests.

    Args:
        auth_token: JWT token fixture

    Returns:
        Dict[str, str]: HTTP headers with Bearer token authorization
    """
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(name="second_auth_headers")
def second_auth_headers_fixture(second_auth_token: str) -> Dict[str, str]:
    """
    Create authorization headers for the second test user.

    Args:
        second_auth_token: Second user's JWT token fixture

    Returns:
        Dict[str, str]: HTTP headers with Bearer token authorization
    """
    return {"Authorization": f"Bearer {second_auth_token}"}


@pytest.fixture(name="test_todo")
def test_todo_fixture(session: Session, test_user: User) -> Todo:
    """
    Create a test todo item owned by the test user.

    This fixture creates a standard todo item for use in CRUD tests.

    Args:
        session: Test database session fixture
        test_user: Test user fixture

    Returns:
        Todo: Created todo item
    """
    todo = Todo(
        id=uuid.uuid4(),
        title="Test Todo",
        description="Test todo description",
        completed=False,
        user_id=test_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@pytest.fixture(name="second_user_todo")
def second_user_todo_fixture(session: Session, second_test_user: User) -> Todo:
    """
    Create a todo item owned by the second test user.

    This fixture is used to verify that users cannot access
    each other's todo items.

    Args:
        session: Test database session fixture
        second_test_user: Second test user fixture

    Returns:
        Todo: Todo item owned by second user
    """
    todo = Todo(
        id=uuid.uuid4(),
        title="Other User's Todo",
        description="This belongs to another user",
        completed=False,
        user_id=second_test_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


def create_test_user_data(
    email: str = "newuser@example.com",
    password: str = "newpassword123"
) -> Dict[str, Any]:
    """
    Helper function to create user registration data.

    Args:
        email: User email address
        password: User password

    Returns:
        Dict containing user registration payload
    """
    return {
        "email": email,
        "password": password
    }


def create_test_todo_data(
    title: str = "New Todo",
    description: str = "New todo description",
    completed: bool = False,
    due_date: str = None
) -> Dict[str, Any]:
    """
    Helper function to create todo creation data.

    Args:
        title: Todo title
        description: Todo description
        completed: Completion status
        due_date: Optional due date in ISO format

    Returns:
        Dict containing todo creation payload
    """
    data = {
        "title": title,
        "description": description,
        "completed": completed
    }
    if due_date:
        data["due_date"] = due_date
    return data
