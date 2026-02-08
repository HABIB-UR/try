# Data Model: Phase II – Todo Full-Stack Web Application

## User Model

### Attributes
- **id** (UUID, Primary Key)
  - Type: UUID
  - Required: Yes
  - Unique: Yes
  - Description: Unique identifier for the user

- **email** (String)
  - Type: String (max_length=255)
  - Required: Yes
  - Unique: Yes
  - Description: User's email address for authentication

- **hashed_password** (String)
  - Type: String
  - Required: Yes
  - Description: BCrypt hashed password for secure storage

- **created_at** (DateTime)
  - Type: DateTime (timezone-aware)
  - Required: No (defaults to current time)
  - Description: Timestamp when the user record was created

- **updated_at** (DateTime)
  - Type: DateTime (timezone-aware)
  - Required: No (auto-updates)
  - Description: Timestamp when the user record was last updated

### Relationships
- **todos** (OneToMany)
  - Related model: Todo
  - Relationship: One User can have many Todos
  - Back reference: todo.user

## Todo Model

### Attributes
- **id** (UUID, Primary Key)
  - Type: UUID
  - Required: Yes
  - Unique: Yes
  - Description: Unique identifier for the todo item

- **title** (String)
  - Type: String (max_length=200)
  - Required: Yes
  - Description: Brief title of the todo item

- **description** (Text)
  - Type: Text (optional)
  - Required: No
  - Description: Detailed description of the todo item

- **completed** (Boolean)
  - Type: Boolean
  - Required: No (defaults to False)
  - Description: Indicates whether the todo item is completed

- **due_date** (DateTime)
  - Type: DateTime (timezone-aware, optional)
  - Required: No
  - Description: Optional deadline for completing the todo item

- **user_id** (UUID, Foreign Key)
  - Type: UUID
  - Required: Yes
  - Description: Foreign key linking to the owning user

- **created_at** (DateTime)
  - Type: DateTime (timezone-aware)
  - Required: No (defaults to current time)
  - Description: Timestamp when the todo was created

- **updated_at** (DateTime)
  - Type: DateTime (timezone-aware)
  - Required: No (auto-updates)
  - Description: Timestamp when the todo was last updated

### Relationships
- **user** (ManyToOne)
  - Related model: User
  - Relationship: Many Todos belong to one User
  - Back reference: user.todos

## Validation Rules

### User Validation
- Email must be a valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements
- User cannot be deleted if they have associated todos

### Todo Validation
- Title must not be empty (min length 1)
- Title must not exceed 200 characters
- Due date must not be in the past (business rule)
- Completed status can only be true or false
- Todo can only be created for authenticated user
- Todo can only be accessed by the owning user

## Indexes

### User Model
- Index on email (for fast authentication lookup)

### Todo Model
- Index on user_id (for efficient user-specific queries)
- Index on completed field (for filtering completed/incomplete todos)
- Composite index on (user_id, completed) for optimized queries

## State Transitions

### Todo State Changes
- New Todo: completed=False (default)
- Complete Todo: completed=True (toggle allowed)
- Uncomplete Todo: completed=False (toggle allowed)
- Deleted Todo: Record removal from database