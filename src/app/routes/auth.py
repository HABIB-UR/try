"""
Authentication routes for Better Auth + JWT integration.

Provides registration and login endpoints that issue JWT tokens
compatible with the Better Auth frontend.
"""

import re
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr, field_validator

from ..database import get_session
from ..models.user import User, UserCreate
from ..schemas.user import UserPublic, Token
from ..auth import authenticate_user, create_access_token, get_password_hash
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


class RegisterRequest(BaseModel):
    """Registration request with email validation."""
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format."""
        # Basic email regex pattern
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower().strip()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password requirements."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class RegisterResponse(BaseModel):
    """Registration response with user info."""
    message: str
    user: UserPublic


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(user: RegisterRequest, session: Session = Depends(get_session)):
    """
    Register a new user.

    - Validates email format
    - Checks for duplicate email (409 Conflict)
    - Hashes password with bcrypt
    - Returns user info on success
    """
    # Check if user already exists
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        logger.info(f"Registration attempt with existing email: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create new user
    db_user = User(
        email=user.email,
        hashed_password=hashed_password
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    logger.info(f"New user registered: {db_user.email}")

    # Return response with user info
    return RegisterResponse(
        message="User registered successfully",
        user=UserPublic(
            id=db_user.id,
            email=db_user.email,
            created_at=db_user.created_at
        )
    )


class LoginRequest(BaseModel):
    """Login request."""
    email: str
    password: str


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, session: Session = Depends(get_session)):
    """
    Authenticate user and return JWT token.

    - Validates credentials
    - Returns generic "Invalid credentials" on any auth failure (prevents user enumeration)
    - Issues JWT token with user ID and email in payload
    """
    user = authenticate_user(session, credentials.email.lower().strip(), credentials.password)

    if not user:
        # Generic error message - don't reveal if email exists or password is wrong
        logger.info(f"Failed login attempt for: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token with Better Auth compatible format
    # Include both user ID (sub) and email for frontend convenience
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),  # User ID as subject
            "email": user.email,
        },
        expires_delta=access_token_expires
    )

    logger.info(f"User logged in: {user.email}")

    return Token(access_token=access_token, token_type="bearer")