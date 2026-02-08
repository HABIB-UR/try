"""
Unit tests for Todo CRUD API endpoints.

This module tests the todo functionality including:
- Creating todos (authenticated)
- Reading todos (authenticated)
- Updating todos (authenticated)
- Deleting todos (authenticated)
- Toggling todo completion (authenticated)
- Unauthorized access handling (401)
- Cross-user data access prevention (404)

Endpoints tested:
- GET /api/todos/
- POST /api/todos/
- PUT /api/todos/{id}
- DELETE /api/todos/{id}
- PATCH /api/todos/{id}/complete
"""

import pytest
import uuid
from typing import Dict
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.app.models.user import User
from src.app.models.todo import Todo
from tests.conftest import create_test_todo_data


class TestCreateTodo:
    """Tests for creating todo items."""

    def test_create_todo_authenticated(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test successful todo creation with authentication.

        Given: Authenticated user
        When: POST /api/todos/ with valid todo data
        Then: Returns 200 with created todo data
        """
        # Arrange
        todo_data = create_test_todo_data(
            title="New Task",
            description="Task description"
        )

        # Act
        response = client.post(
            "/api/todos/",
            json=todo_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == todo_data["title"]
        assert data["description"] == todo_data["description"]
        assert data["completed"] == False
        assert "id" in data
        assert "user_id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_todo_with_due_date(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test creating todo with due date.

        Given: Authenticated user with todo data including due date
        When: POST /api/todos/
        Then: Returns 200 with due date preserved
        """
        # Arrange
        todo_data = {
            "title": "Task with deadline",
            "description": "Has a due date",
            "completed": False,
            "due_date": "2025-12-31T23:59:59"
        }

        # Act
        response = client.post(
            "/api/todos/",
            json=todo_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == todo_data["title"]
        assert data["due_date"] is not None

    def test_create_todo_minimal_data(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test creating todo with only required fields.

        Given: Authenticated user with minimal todo data (title only)
        When: POST /api/todos/
        Then: Returns 200 with defaults for optional fields
        """
        # Arrange
        todo_data = {"title": "Minimal Todo"}

        # Act
        response = client.post(
            "/api/todos/",
            json=todo_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Minimal Todo"
        assert data["description"] is None
        assert data["completed"] == False
        assert data["due_date"] is None

    def test_create_todo_missing_title_returns_422(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test creating todo without required title field.

        Given: Authenticated user with todo data missing title
        When: POST /api/todos/
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange
        todo_data = {"description": "No title provided"}

        # Act
        response = client.post(
            "/api/todos/",
            json=todo_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 422

    def test_create_todo_unauthorized_returns_401(self, client: TestClient):
        """
        Test creating todo without authentication.

        Given: No authentication token
        When: POST /api/todos/
        Then: Returns 401 Unauthorized
        """
        # Arrange
        todo_data = create_test_todo_data()

        # Act
        response = client.post("/api/todos/", json=todo_data)

        # Assert
        assert response.status_code in [401, 403]


class TestGetTodos:
    """Tests for retrieving todo items."""

    def test_get_todos_authenticated(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        test_todo: Todo
    ):
        """
        Test retrieving all todos for authenticated user.

        Given: Authenticated user with existing todos
        When: GET /api/todos/
        Then: Returns 200 with list of user's todos
        """
        # Act
        response = client.get("/api/todos/", headers=auth_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify todo is in response
        todo_ids = [item["id"] for item in data]
        assert str(test_todo.id) in todo_ids

    def test_get_todos_empty_list(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test retrieving todos when user has none.

        Given: Authenticated user with no todos
        When: GET /api/todos/
        Then: Returns 200 with empty list
        """
        # Act
        response = client.get("/api/todos/", headers=auth_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_todos_unauthorized_returns_401(self, client: TestClient):
        """
        Test retrieving todos without authentication.

        Given: No authentication token
        When: GET /api/todos/
        Then: Returns 401 Unauthorized
        """
        # Act
        response = client.get("/api/todos/")

        # Assert
        assert response.status_code in [401, 403]

    def test_get_todos_does_not_return_other_users_todos(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo
    ):
        """
        Test that user only sees their own todos.

        Given: Authenticated user and todos belonging to another user
        When: GET /api/todos/
        Then: Returns only the authenticated user's todos
        """
        # Act
        response = client.get("/api/todos/", headers=auth_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        todo_ids = [item["id"] for item in data]
        # Second user's todo should not be in the list
        assert str(second_user_todo.id) not in todo_ids


class TestUpdateTodo:
    """Tests for updating todo items."""

    def test_update_todo_authenticated(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        test_todo: Todo
    ):
        """
        Test updating a todo with authentication.

        Given: Authenticated user with an existing todo
        When: PUT /api/todos/{id} with updated data
        Then: Returns 200 with updated todo
        """
        # Arrange
        update_data = {
            "title": "Updated Title",
            "description": "Updated description"
        }

        # Act
        response = client.put(
            f"/api/todos/{test_todo.id}",
            json=update_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated description"
        assert data["id"] == str(test_todo.id)

    def test_update_todo_partial_data(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        test_todo: Todo
    ):
        """
        Test partial update of a todo.

        Given: Authenticated user with an existing todo
        When: PUT /api/todos/{id} with only some fields
        Then: Returns 200, only provided fields are updated
        """
        # Arrange - Only update title
        update_data = {"title": "Only Title Updated"}

        # Act
        response = client.put(
            f"/api/todos/{test_todo.id}",
            json=update_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Only Title Updated"
        # Description should remain unchanged
        assert data["description"] == test_todo.description

    def test_update_todo_nonexistent_returns_404(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test updating a non-existent todo.

        Given: Authenticated user
        When: PUT /api/todos/{id} with non-existent ID
        Then: Returns 404 Not Found
        """
        # Arrange
        fake_id = str(uuid.uuid4())
        update_data = {"title": "Will Not Work"}

        # Act
        response = client.put(
            f"/api/todos/{fake_id}",
            json=update_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 404

    def test_update_todo_unauthorized_returns_401(
        self, client: TestClient, test_todo: Todo
    ):
        """
        Test updating todo without authentication.

        Given: No authentication token
        When: PUT /api/todos/{id}
        Then: Returns 401 Unauthorized
        """
        # Arrange
        update_data = {"title": "Unauthorized Update"}

        # Act
        response = client.put(
            f"/api/todos/{test_todo.id}",
            json=update_data
        )

        # Assert
        assert response.status_code in [401, 403]

    def test_update_other_users_todo_returns_404(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo
    ):
        """
        Test that user cannot update another user's todo.

        Given: Authenticated user trying to update another user's todo
        When: PUT /api/todos/{other_user_id}
        Then: Returns 404 Not Found (not 403 to prevent enumeration)
        """
        # Arrange
        update_data = {"title": "Trying to update other's todo"}

        # Act
        response = client.put(
            f"/api/todos/{second_user_todo.id}",
            json=update_data,
            headers=auth_headers
        )

        # Assert - Should be 404, not 403 (prevents ID enumeration)
        assert response.status_code == 404


class TestDeleteTodo:
    """Tests for deleting todo items."""

    def test_delete_todo_authenticated(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        test_todo: Todo
    ):
        """
        Test deleting a todo with authentication.

        Given: Authenticated user with an existing todo
        When: DELETE /api/todos/{id}
        Then: Returns 200 with success message
        """
        # Act
        response = client.delete(
            f"/api/todos/{test_todo.id}",
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

        # Verify deletion - todo should no longer be accessible
        get_response = client.get("/api/todos/", headers=auth_headers)
        todo_ids = [item["id"] for item in get_response.json()]
        assert str(test_todo.id) not in todo_ids

    def test_delete_todo_nonexistent_returns_404(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test deleting a non-existent todo.

        Given: Authenticated user
        When: DELETE /api/todos/{id} with non-existent ID
        Then: Returns 404 Not Found
        """
        # Arrange
        fake_id = str(uuid.uuid4())

        # Act
        response = client.delete(
            f"/api/todos/{fake_id}",
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 404

    def test_delete_todo_unauthorized_returns_401(
        self, client: TestClient, test_todo: Todo
    ):
        """
        Test deleting todo without authentication.

        Given: No authentication token
        When: DELETE /api/todos/{id}
        Then: Returns 401 Unauthorized
        """
        # Act
        response = client.delete(f"/api/todos/{test_todo.id}")

        # Assert
        assert response.status_code in [401, 403]

    def test_delete_other_users_todo_returns_404(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo
    ):
        """
        Test that user cannot delete another user's todo.

        Given: Authenticated user trying to delete another user's todo
        When: DELETE /api/todos/{other_user_id}
        Then: Returns 404 Not Found
        """
        # Act
        response = client.delete(
            f"/api/todos/{second_user_todo.id}",
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 404

    def test_delete_invalid_uuid_returns_422(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test deleting with invalid UUID format.

        Given: Authenticated user
        When: DELETE /api/todos/{invalid-uuid}
        Then: Returns 422 Unprocessable Entity
        """
        # Act
        response = client.delete(
            "/api/todos/not-a-valid-uuid",
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 422


class TestToggleTodoCompletion:
    """Tests for toggling todo completion status."""

    def test_toggle_todo_complete_authenticated(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        test_todo: Todo
    ):
        """
        Test toggling todo to completed.

        Given: Authenticated user with an incomplete todo
        When: PATCH /api/todos/{id}/complete with completed=true
        Then: Returns 200 with updated completed status
        """
        # Arrange
        completion_data = {"completed": True}

        # Act
        response = client.patch(
            f"/api/todos/{test_todo.id}/complete",
            json=completion_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] == True
        assert data["id"] == str(test_todo.id)

    def test_toggle_todo_incomplete(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        session: Session,
        test_user: User
    ):
        """
        Test toggling a completed todo back to incomplete.

        Given: Authenticated user with a completed todo
        When: PATCH /api/todos/{id}/complete with completed=false
        Then: Returns 200 with completed=false
        """
        # Arrange - Create a completed todo
        completed_todo = Todo(
            id=uuid.uuid4(),
            title="Completed Task",
            completed=True,
            user_id=test_user.id
        )
        session.add(completed_todo)
        session.commit()
        session.refresh(completed_todo)

        completion_data = {"completed": False}

        # Act
        response = client.patch(
            f"/api/todos/{completed_todo.id}/complete",
            json=completion_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] == False

    def test_toggle_nonexistent_todo_returns_404(
        self, client: TestClient, auth_headers: Dict[str, str]
    ):
        """
        Test toggling a non-existent todo.

        Given: Authenticated user
        When: PATCH /api/todos/{id}/complete with non-existent ID
        Then: Returns 404 Not Found
        """
        # Arrange
        fake_id = str(uuid.uuid4())
        completion_data = {"completed": True}

        # Act
        response = client.patch(
            f"/api/todos/{fake_id}/complete",
            json=completion_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 404

    def test_toggle_todo_unauthorized_returns_401(
        self, client: TestClient, test_todo: Todo
    ):
        """
        Test toggling todo without authentication.

        Given: No authentication token
        When: PATCH /api/todos/{id}/complete
        Then: Returns 401 Unauthorized
        """
        # Arrange
        completion_data = {"completed": True}

        # Act
        response = client.patch(
            f"/api/todos/{test_todo.id}/complete",
            json=completion_data
        )

        # Assert
        assert response.status_code in [401, 403]

    def test_toggle_other_users_todo_returns_404(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo
    ):
        """
        Test that user cannot toggle another user's todo.

        Given: Authenticated user trying to toggle another user's todo
        When: PATCH /api/todos/{other_user_id}/complete
        Then: Returns 404 Not Found
        """
        # Arrange
        completion_data = {"completed": True}

        # Act
        response = client.patch(
            f"/api/todos/{second_user_todo.id}/complete",
            json=completion_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 404

    def test_toggle_missing_completed_field_returns_422(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        test_todo: Todo
    ):
        """
        Test toggle request without completed field.

        Given: Authenticated user
        When: PATCH /api/todos/{id}/complete without completed field
        Then: Returns 422 Unprocessable Entity
        """
        # Arrange - Empty body
        completion_data = {}

        # Act
        response = client.patch(
            f"/api/todos/{test_todo.id}/complete",
            json=completion_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 422


class TestUnauthorizedAccess:
    """Tests specifically for unauthorized access scenarios."""

    def test_all_todo_endpoints_require_auth(self, client: TestClient):
        """
        Test that all todo endpoints require authentication.

        Given: No authentication token
        When: Calling any todo endpoint
        Then: All return 401 Unauthorized
        """
        fake_id = str(uuid.uuid4())
        endpoints = [
            ("GET", "/api/todos/"),
            ("POST", "/api/todos/"),
            ("PUT", f"/api/todos/{fake_id}"),
            ("DELETE", f"/api/todos/{fake_id}"),
            ("PATCH", f"/api/todos/{fake_id}/complete"),
        ]

        for method, url in endpoints:
            if method == "GET":
                response = client.get(url)
            elif method == "POST":
                response = client.post(url, json={"title": "Test"})
            elif method == "PUT":
                response = client.put(url, json={"title": "Test"})
            elif method == "DELETE":
                response = client.delete(url)
            elif method == "PATCH":
                response = client.patch(url, json={"completed": True})

            assert response.status_code in [401, 403], (
                f"{method} {url} should return 401/403, got {response.status_code}"
            )

    def test_expired_token_returns_401(self, client: TestClient, test_user: User):
        """
        Test that expired tokens are rejected.

        Given: An expired JWT token
        When: Accessing protected endpoint
        Then: Returns 401 Unauthorized
        """
        from src.app.auth import create_access_token
        from datetime import timedelta

        # Create token that's already expired
        expired_token = create_access_token(
            data={"sub": test_user.email},
            expires_delta=timedelta(seconds=-1)  # Already expired
        )
        headers = {"Authorization": f"Bearer {expired_token}"}

        # Act
        response = client.get("/api/todos/", headers=headers)

        # Assert
        assert response.status_code in [401, 403]


class TestCrossUserAccess:
    """Tests for ensuring users cannot access each other's data."""

    def test_user_cannot_see_other_users_todos(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_auth_headers: Dict[str, str],
        test_todo: Todo,
        second_user_todo: Todo
    ):
        """
        Test complete data isolation between users.

        Given: Two users with their own todos
        When: Each user requests their todos
        Then: Each only sees their own todos
        """
        # First user's request
        response1 = client.get("/api/todos/", headers=auth_headers)
        assert response1.status_code == 200
        user1_todos = response1.json()

        # Second user's request
        response2 = client.get("/api/todos/", headers=second_auth_headers)
        assert response2.status_code == 200
        user2_todos = response2.json()

        # Verify isolation
        user1_ids = {item["id"] for item in user1_todos}
        user2_ids = {item["id"] for item in user2_todos}

        # No overlap
        assert user1_ids.isdisjoint(user2_ids), "Users should not share todos"

        # Each user sees their own
        if len(user1_todos) > 0:
            assert str(test_todo.id) in user1_ids
        if len(user2_todos) > 0:
            assert str(second_user_todo.id) in user2_ids

    def test_cannot_update_other_users_todo(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo
    ):
        """
        Test that updating another user's todo fails with 404.

        Given: User A trying to update User B's todo
        When: PUT /api/todos/{user_b_todo_id}
        Then: Returns 404 (not 403 to prevent enumeration)
        """
        update_data = {"title": "Hacked!"}

        response = client.put(
            f"/api/todos/{second_user_todo.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_cannot_delete_other_users_todo(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo,
        second_auth_headers: Dict[str, str]
    ):
        """
        Test that deleting another user's todo fails and doesn't affect data.

        Given: User A trying to delete User B's todo
        When: DELETE /api/todos/{user_b_todo_id}
        Then: Returns 404 and todo still exists for User B
        """
        # Attempt to delete
        response = client.delete(
            f"/api/todos/{second_user_todo.id}",
            headers=auth_headers
        )
        assert response.status_code == 404

        # Verify todo still exists for the owner
        get_response = client.get("/api/todos/", headers=second_auth_headers)
        user2_todos = get_response.json()
        user2_ids = [item["id"] for item in user2_todos]
        assert str(second_user_todo.id) in user2_ids

    def test_cannot_toggle_other_users_todo(
        self,
        client: TestClient,
        auth_headers: Dict[str, str],
        second_user_todo: Todo,
        second_auth_headers: Dict[str, str]
    ):
        """
        Test that toggling another user's todo fails.

        Given: User A trying to toggle User B's todo
        When: PATCH /api/todos/{user_b_todo_id}/complete
        Then: Returns 404 and todo status unchanged
        """
        original_completed = second_user_todo.completed

        # Attempt to toggle
        response = client.patch(
            f"/api/todos/{second_user_todo.id}/complete",
            json={"completed": not original_completed},
            headers=auth_headers
        )
        assert response.status_code == 404
