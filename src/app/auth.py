"""
Authentication utilities for Better Auth + JWT integration.

This module provides JWT token creation, verification, and user authentication
using a shared secret with the Better Auth frontend.

The BETTER_AUTH_SECRET must match between frontend and backend for JWT verification.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import logging

from jose import JWTError, jwt, ExpiredSignatureError
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from .database import get_session
from .models.user import User
from .config import settings

# Configure logging
logger = logging.getLogger(__name__)

# JWT Configuration from centralized settings (BETTER_AUTH_SECRET)
SECRET_KEY = settings.BETTER_AUTH_SECRET
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_EXPIRATION_MINUTES

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt."""
    try:
        # Convert password and hash to bytes
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception as e:
        logger.error(f"Password verification failed: {str(e)}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    try:
        # Convert password to bytes and generate salt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing failed: {str(e)}")
        raise


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.

    Returns the User if credentials are valid, None otherwise.
    Uses constant-time comparison to prevent timing attacks.
    """
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    # Always verify password even if user not found (prevents timing attacks)
    if not user:
        # Dummy verification to maintain constant time
        # Use a fake hash to keep timing consistent
        bcrypt.checkpw(b"dummy", bcrypt.hashpw(b"dummy", bcrypt.gensalt()))
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with Better Auth compatible format.

    Args:
        data: Payload data (should include 'sub' for user ID and 'email')
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    # Set expiration
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    })

    # Encode with shared secret (BETTER_AUTH_SECRET)
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"Created JWT token for user: {data.get('sub')}")

    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.

    Args:
        token: The JWT token string

    Returns:
        Decoded payload dictionary

    Raises:
        HTTPException: If token is invalid, expired, or malformed
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode and verify signature using BETTER_AUTH_SECRET
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": True}
        )

        # Validate required claims
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("JWT token missing 'sub' claim")
            raise credentials_exception

        return payload

    except ExpiredSignatureError:
        logger.info("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        raise credentials_exception


def get_user_id_from_token(token: str) -> str:
    """
    Extract user ID from JWT token payload.

    Args:
        token: The JWT token string

    Returns:
        User ID (sub claim)

    Raises:
        HTTPException: If token is invalid or missing user ID
    """
    payload = verify_token(token)
    return payload.get("sub")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    FastAPI dependency to get the current authenticated user.

    Extracts and verifies the JWT token from the Authorization header,
    then loads the corresponding user from the database.

    Args:
        credentials: HTTP Bearer credentials from request header
        session: Database session

    Returns:
        Authenticated User object

    Raises:
        HTTPException: 401 if not authenticated or token invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Check for missing credentials
    if credentials is None:
        logger.debug("No authorization credentials provided")
        raise credentials_exception

    # Verify token and extract payload
    try:
        payload = verify_token(credentials.credentials)
        user_id: str = payload.get("sub")
        email: str = payload.get("email")

        if user_id is None:
            raise credentials_exception

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise credentials_exception

    # Load user from database
    # Try to find by ID first (UUID), fallback to email
    user = None
    try:
        import uuid
        user_uuid = uuid.UUID(user_id)
        statement = select(User).where(User.id == user_uuid)
        user = session.exec(statement).first()
    except (ValueError, TypeError):
        # If user_id is not a valid UUID, try email
        if email:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()

    if user is None:
        logger.warning(f"User not found for token: sub={user_id}")
        raise credentials_exception

    logger.debug(f"Authenticated user: {user.email}")
    return user


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """
    FastAPI dependency to get just the current user's ID from the token.

    Useful for ownership checks without loading the full user object.

    Args:
        credentials: HTTP Bearer credentials from request header

    Returns:
        User ID string from JWT payload

    Raises:
        HTTPException: 401 if not authenticated or token invalid
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return get_user_id_from_token(credentials.credentials)
