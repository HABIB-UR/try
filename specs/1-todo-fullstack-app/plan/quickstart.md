# Quickstart Guide: Todo Full-Stack Application

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- Neon PostgreSQL account and database instance
- Git for version control

## Project Setup

### 1. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require"

# Authentication Secret
BETTER_AUTH_SECRET="your-super-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_MINUTES=1440  # 24 hours
```

Generate secure secrets using:
```bash
openssl rand -hex 32  # for BETTER_AUTH_SECRET
openssl rand -hex 32  # for JWT_SECRET
```

### 2. Backend Setup (FastAPI)

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install fastapi uvicorn sqlmodel psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv
```

3. Project structure:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI application entry point
│   ├── database.py         # Database session and engine setup
│   ├── models/             # SQLModel models
│   │   ├── __init__.py
│   │   ├── user.py         # User model
│   │   └── todo.py         # Todo model
│   ├── schemas/            # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py         # User schemas
│   │   └── todo.py         # Todo schemas
│   ├── routes/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py         # Authentication routes
│   │   └── todos.py        # Todo routes
│   └── auth.py             # Authentication utilities and dependencies
└── requirements.txt
```

4. Run the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup (Next.js)

1. Initialize Next.js project:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
```

2. Install additional dependencies:
```bash
npm install @better-auth/client better-auth react-icons
```

3. Project structure:
```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── todos/
│   │           └── page.tsx
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── Todo/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoForm.tsx
│   │   └── Layout/
│   │       └── Navbar.tsx
│   ├── lib/
│   │   ├── auth.ts         # Auth utilities
│   │   ├── api.ts          # API client with JWT handling
│   │   └── types.ts        # TypeScript type definitions
│   └── hooks/
│       └── useTodos.ts     # Custom hook for todo operations
├── public/
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

4. Run the frontend:
```bash
npm run dev
```

### 4. Better Auth Configuration

1. Install Better Auth:
```bash
npm install better-auth @better-auth/node
```

2. Create auth configuration in `frontend/src/lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth";
import { nextjs } from "@better-auth/nextjs";

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: process.env.DATABASE_URL!,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
});

export const { getServerSession, signOut, signIn } = nextjs(auth, {
  basePath: "/api/auth",
});
```

### 5. API Integration

Configure the frontend to communicate with the backend API:

1. Create API client with JWT handling:
```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('jwt_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('jwt_token');
        window.location.href = '/auth/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
```

## Running the Application

1. Start the backend:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

2. In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend docs: http://localhost:8000/docs
   - Backend redoc: http://localhost:8000/redoc

## Development Commands

### Backend
- Format code: `black . && isort .`
- Run tests: `pytest`
- Run with debugger: `uvicorn app.main:app --reload --port 8000 --debug`

### Frontend
- Run linter: `npm run lint`
- Format code: `npm run format`
- Run tests: `npm run test`

## Troubleshooting

1. **Database Connection Issues**:
   - Verify DATABASE_URL is correctly set in .env
   - Check Neon PostgreSQL instance is running
   - Confirm firewall rules allow connections

2. **Authentication Issues**:
   - Ensure BETTER_AUTH_SECRET is set correctly
   - Check JWT token is being sent in API requests
   - Verify auth endpoints are properly configured

3. **Cross-Origin Issues**:
   - Configure CORS in FastAPI backend
   - Verify NEXT_PUBLIC_API_URL points to correct backend address

4. **Environment Variables Not Loading**:
   - Ensure .env file is in correct location
   - Restart development servers after changing .env
   - Verify environment variables are prefixed correctly (NEXT_PUBLIC_ for frontend)