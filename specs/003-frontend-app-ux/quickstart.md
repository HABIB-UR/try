# Quickstart Guide: Frontend Application & UX

**Feature**: 003-frontend-app-ux
**Date**: 2026-02-07
**Status**: Complete

## Overview

This guide provides step-by-step instructions for setting up and running the frontend application. It assumes the backend API is already running.

---

## Prerequisites

- **Node.js**: 18.x or later
- **npm**: 9.x or later (comes with Node.js)
- **Backend API**: Running at `http://localhost:8000` (see backend setup)
- **Git**: For cloning the repository

---

## Environment Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` from the example file:

```bash
# Windows
copy .env.local.example .env.local

# Unix/Mac
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth (must match backend BETTER_AUTH_SECRET)
BETTER_AUTH_SECRET=your-shared-secret-min-32-characters
```

**Important**: The `BETTER_AUTH_SECRET` must match the value configured in the backend.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── api/auth/[...all]/  # Better Auth API route
│   │   ├── auth/
│   │   │   ├── login/page.tsx  # Sign-in page
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       └── page.tsx        # Task dashboard (protected)
│   ├── components/
│   │   ├── Auth/               # Authentication components
│   │   ├── Todo/               # Task management components
│   │   └── UI/                 # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth hook
│   │   └── useTodos.ts         # Todo CRUD hook
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── auth.ts             # Better Auth client
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables (not committed)
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Key Files

### API Client (`src/lib/api.ts`)

Handles all communication with the backend API:

```typescript
// Base URL from environment
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// All API methods:
// - register(email, password) - Register new user
// - login(email, password) - Sign in user
// - getTodos() - Fetch user's todos
// - createTodo(data) - Create new todo
// - updateTodo(id, data) - Update existing todo
// - deleteTodo(id) - Delete todo
// - toggleComplete(id) - Toggle completion status
```

### Auth Context (`src/contexts/AuthContext.tsx`)

Provides authentication state and methods:

```typescript
// State available via useAuth hook:
// - user: Current user object or null
// - token: JWT token or null
// - isAuthenticated: Boolean
// - isLoading: Boolean
// - error: Error message or null

// Methods:
// - login(email, password)
// - register(email, password)
// - logout()
// - clearError()
```

### Todos Hook (`src/hooks/useTodos.ts`)

Provides todo operations with state management:

```typescript
// State:
// - todos: Array of todo items
// - isLoading: Boolean
// - error: Error message or null

// Methods:
// - fetchTodos() - Load todos from API
// - createTodo(data) - Create new todo
// - updateTodo(id, data) - Update todo
// - deleteTodo(id) - Delete todo
// - toggleComplete(id) - Toggle completion
```

---

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page with sign-in/sign-up | No |
| `/auth/login` | Sign-in form | No |
| `/auth/register` | Registration form | No |
| `/dashboard` | Task management dashboard | Yes |

---

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## Development Workflow

### 1. Start Backend (separate terminal)

```bash
cd src
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend (separate terminal)

```bash
cd frontend
npm run dev
```

### 3. Access Application

Open `http://localhost:3000` in your browser.

---

## Common Issues

### CORS Errors

If you see CORS errors in the browser console:

1. Verify backend is running on port 8000
2. Check that `CORS_ORIGINS` in backend includes `http://localhost:3000`
3. Restart the backend server

### Authentication Failures

If authentication fails:

1. Verify `BETTER_AUTH_SECRET` matches in both `.env` files
2. Clear browser localStorage: `localStorage.clear()`
3. Check backend logs for token verification errors

### Type Errors

If you see TypeScript errors related to Todo types:

1. Ensure `src/types/index.ts` has correct type definitions
2. Run `npm run type-check` to see full error details
3. Check that API response fields match expected types

### API Connection Issues

If the frontend can't connect to the API:

1. Verify backend is running: `curl http://localhost:8000/`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Look for network errors in browser DevTools

---

## Responsive Breakpoints

The application uses Tailwind CSS breakpoints:

| Breakpoint | Screen Size | Layout |
|------------|-------------|--------|
| Default | < 768px (mobile) | Single column |
| `md:` | 768px+ (tablet) | Two columns |
| `lg:` | 1024px+ (desktop) | Full layout |

Test at these widths to verify responsive behavior.

---

## Next Steps

1. Review `specs/003-frontend-app-ux/spec.md` for full requirements
2. Review `specs/003-frontend-app-ux/contracts/components.md` for component specs
3. Run `/sp.tasks` to generate implementation tasks
4. Begin implementation using `nextjs-frontend-dev` agent
