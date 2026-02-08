---
name: database-skill
description: Design and manage database schemas, create tables, and handle migrations. Use for backend applications.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Plan entities and their relationships
   - Define primary keys and foreign keys
   - Normalize tables to reduce redundancy
   - Use indexes for performance optimization

2. **Table Creation**
   - Define table names clearly
   - Specify column types and constraints
   - Add default values where necessary
   - Ensure proper handling of nulls

3. **Migrations**
   - Create versioned migration files
   - Apply schema changes incrementally
   - Rollback migrations safely if needed
   - Keep migration history for audit

4. **Best Practices**
   - Use descriptive table and column names
   - Avoid storing sensitive data in plain text
   - Use transactions for critical updates
   - Document schema changes

## Example SQL Structure

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
