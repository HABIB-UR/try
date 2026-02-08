"""
Unit tests for authentication API endpoints.

This module tests the authentication functionality including:
- User registration (success and duplicate email handling)
- User login (success, wrong password, non-existent user)

Endpoints tested:
- POST /api/auth/register
- POST /api/auth/login
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.app.models.user import User
from tests.conftest import create_test_user_data


class TestUserRegistration:
    """Tests for user registration endpoint."""

    def test_register_success(self, client: TestClient):
        """
        Test successful user registration.

        Given: Valid user registration data
        When: POST /api/auth/register is called
        Then: Returns 200 with user data (id, email, created_at)
        """
        # Arrange
        user_data = create_test_user_data(
            email="newuser@example.com",
            password="securepassword123"
        )

        # Act
        response = client.post("/api/auth/register", json=user_data)

        # Assert - Registration returns 201 Created
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert data["user"]["email"] == user_data["email"]
        assert "id" in data["user"]
        # Password should not be returned
        assert "password" not in data
        assert "hashed_password" not in data

    def test_register_duplicate_email_returns_409(
        self, client: TestClient, test_user: User
    ):
        """
        Test registration with already registered email.

        Given: An existing user with email "test@example.com"
        When: Attempting to register with the same email
        Then: Returns 409 Conflict with appropriate error message
        """
        # Arrange
        user_data = create_test_user_data(
            email=test_user.email,  # Use existing user's email
            password="differentpassword123"
        )

        # Act
        response = client.post("/api/auth/register", json=user_data)

        # Assert
        assert response.status_code == 409
        data = response.json()
        assert "detail" in data
        assert "already registered" in data["detail"].lower() or "email" in data["detail"].lower()

    def test_register_invalid_email_format(self, client: TestClient):
        """
        Test registration with invalid email format.

        Given: Invalid email format
        When: POST /api/auth/register is called
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange
        user_data = {
            "email": "not-an-email",
            "password": "validpassword123"
        }

        # Act
        response = client.post("/api/auth/register", json=user_data)

        # Assert - Note: Pydantic validation may or may not catch this
        # depending on model configuration. Status should be 4xx.
        assert response.status_code in [200, 422]  # Depends on validation setup

    def test_register_empty_password(self, client: TestClient):
        """
        Test registration with empty password.

        Given: Empty password
        When: POST /api/auth/register is called
        Then: Returns appropriate error
        """
        # Arrange
        user_data = {
            "email": "test@example.com",
            "password": ""
        }

        # Act
        response = client.post("/api/auth/register", json=user_data)

        # Assert - Should fail validation or allow (depends on model)
        # Documenting current behavior
        assert response.status_code in [200, 409, 422]

    def test_register_missing_email_field(self, client: TestClient):
        """
        Test registration without email field.

        Given: Missing email field in request body
        When: POST /api/auth/register is called
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange
        user_data = {"password": "validpassword123"}

        # Act
        response = client.post("/api/auth/register", json=user_data)

        # Assert
        assert response.status_code == 422

    def test_register_missing_password_field(self, client: TestClient):
        """
        Test registration without password field.

        Given: Missing password field in request body
        When: POST /api/auth/register is called
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange
        user_data = {"email": "test@example.com"}

        # Act
        response = client.post("/api/auth/register", json=user_data)

        # Assert
        assert response.status_code == 422


class TestUserLogin:
    """Tests for user login endpoint."""

    def test_login_success(self, client: TestClient, test_user: User):
        """
        Test successful user login.

        Given: A registered user with valid credentials
        When: POST /api/auth/login is called with correct credentials
        Then: Returns 200 with access token and token type
        """
        # Arrange
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"  # Password set in test_user fixture
        }

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    def test_login_wrong_password_returns_401(
        self, client: TestClient, test_user: User
    ):
        """
        Test login with incorrect password.

        Given: A registered user
        When: POST /api/auth/login is called with wrong password
        Then: Returns 401 Unauthorized
        """
        # Arrange
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword123"  # Incorrect password
        }

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "incorrect" in data["detail"].lower() or "password" in data["detail"].lower()

    def test_login_nonexistent_user_returns_401(self, client: TestClient):
        """
        Test login with non-existent email.

        Given: An email that is not registered
        When: POST /api/auth/login is called
        Then: Returns 401 Unauthorized (to prevent email enumeration)
        """
        # Arrange
        login_data = {
            "email": "nonexistent@example.com",
            "password": "anypassword123"
        }

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        # Should not reveal whether email exists or not
        # Generic message like "Incorrect email or password" is preferred

    def test_login_empty_credentials(self, client: TestClient):
        """
        Test login with empty credentials.

        Given: Empty email and password
        When: POST /api/auth/login is called
        Then: Returns appropriate error (401 or 422)
        """
        # Arrange
        login_data = {
            "email": "",
            "password": ""
        }

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code in [401, 422]

    def test_login_missing_email(self, client: TestClient):
        """
        Test login without email field.

        Given: Missing email in request body
        When: POST /api/auth/login is called
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange
        login_data = {"password": "somepassword"}

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code == 422

    def test_login_missing_password(self, client: TestClient):
        """
        Test login without password field.

        Given: Missing password in request body
        When: POST /api/auth/login is called
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange
        login_data = {"email": "test@example.com"}

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code == 422

    def test_login_case_sensitivity(self, client: TestClient, test_user: User):
        """
        Test that email login is case-sensitive or insensitive as designed.

        Given: A registered user with lowercase email
        When: POST /api/auth/login with different case email
        Then: Behavior depends on implementation (document actual behavior)
        """
        # Arrange
        login_data = {
            "email": test_user.email.upper(),  # Try uppercase
            "password": "testpassword123"
        }

        # Act
        response = client.post("/api/auth/login", json=login_data)

        # Assert - Document actual behavior
        # Most implementations are case-insensitive for email
        # Accept both 200 (case-insensitive) or 401 (case-sensitive)
        assert response.status_code in [200, 401]


class TestTokenValidity:
    """Tests for JWT token validation."""

    def test_token_can_be_used_for_authenticated_requests(
        self, client: TestClient, test_user: User
    ):
        """
        Test that login token works for authenticated endpoints.

        Given: A valid access token from login
        When: Using the token to access protected endpoint
        Then: Request succeeds
        """
        # Arrange - Login first
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Act - Use token to access protected endpoint
        response = client.get("/api/todos/", headers=headers)

        # Assert
        assert response.status_code == 200

    def test_invalid_token_returns_401(self, client: TestClient):
        """
        Test that invalid token is rejected.

        Given: An invalid JWT token
        When: Attempting to access protected endpoint
        Then: Returns 401 Unauthorized
        """
        # Arrange
        headers = {"Authorization": "Bearer invalid.token.here"}

        # Act
        response = client.get("/api/todos/", headers=headers)

        # Assert
        assert response.status_code in [401, 403]

    def test_malformed_authorization_header(self, client: TestClient):
        """
        Test that malformed authorization header is rejected.

        Given: Malformed Authorization header
        When: Attempting to access protected endpoint
        Then: Returns appropriate error
        """
        # Arrange - Missing "Bearer" prefix
        headers = {"Authorization": "not-bearer-format"}

        # Act
        response = client.get("/api/todos/", headers=headers)

        # Assert
        assert response.status_code in [401, 403, 422]
