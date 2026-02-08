# Research: Authentication & API Security

**Feature**: 002-auth-api-security
**Date**: 2026-02-07

## Research Summary

This document captures research findings for implementing Better Auth with JWT across Next.js frontend and FastAPI backend.

---

## 0.1: Better Auth JWT Plugin Configuration

**Task**: Research how to configure Better Auth with JWT plugin for Next.js App Router

**Decision**: Use Better Auth's built-in JWT plugin with custom payload configuration

**Rationale**:
- Official plugin provides secure defaults (HS256 signing, proper expiration handling)
- Integrates natively with Next.js App Router via auth handlers
- Supports custom payload fields for user identity claims
- Handles token refresh and session management automatically

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Custom JWT implementation | Violates constitution "use established libraries" principle |
| NextAuth.js | Not specified in requirements; Better Auth is mandated |
| Passport.js | Server-side only, doesn't fit Next.js App Router pattern |

**Implementation Notes**:
```typescript
// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "@better-auth/jwt";

export const auth = betterAuth({
  plugins: [
    jwt({
      secret: process.env.BETTER_AUTH_SECRET,
      expiresIn: "24h",
      payload: (user) => ({
        sub: user.id,
        email: user.email,
      }),
    }),
  ],
});
```

---

## 0.2: Shared Secret Configuration

**Task**: Research best practices for sharing JWT secret between Better Auth and FastAPI

**Decision**: Use single `BETTER_AUTH_SECRET` environment variable accessible to both systems

**Rationale**:
- Single source of truth prevents secret mismatch issues
- Both systems read the same environment variable
- Follows 12-factor app methodology for configuration
- Easy to rotate by updating single variable

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Separate secrets with key exchange | Adds complexity, potential for sync issues |
| Public/private key pair (RS256) | Overkill for single-backend architecture |
| Key management service | Out of scope, adds infrastructure dependency |

**Security Considerations**:
- Secret must be at least 32 characters (256 bits)
- Never commit to version control
- Rotate periodically in production
- Use different secrets per environment

---

## 0.3: JWT Payload Structure

**Task**: Research optimal JWT payload fields for user identification

**Decision**: Include minimal payload: `sub` (user ID), `email`, `iat`, `exp`

**Rationale**:
- `sub` (subject): Standard claim for user identifier per RFC 7519
- `email`: Required for user identification in application
- `iat` (issued at): Standard claim for token issuance timestamp
- `exp` (expiration): Standard claim for token validity period
- Minimal payload reduces token size and attack surface

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Include roles/permissions | Out of scope per spec (no RBAC) |
| Include user profile data | Increases token size, data can become stale |
| Include session ID | Violates stateless authentication requirement |

**JWT Structure**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "iat": 1707350400,
  "exp": 1707436800
}
```

---

## 0.4: FastAPI JWT Verification

**Task**: Research FastAPI middleware for JWT verification with Better Auth tokens

**Decision**: Use python-jose library for JWT decoding with shared secret verification

**Rationale**:
- Compatible with Better Auth's HS256 signing algorithm
- Widely used in FastAPI applications
- Supports all standard JWT claims validation
- Good async support for high-performance applications

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| PyJWT | Similar capability, python-jose has better FastAPI integration |
| Authlib | More complex, designed for OAuth flows |
| Custom implementation | Security risk, unnecessary effort |

**Implementation Pattern**:
```python
# src/app/auth.py
from jose import JWTError, jwt

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

async def get_current_user(token: str) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        # Validate and return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Conclusion

All research tasks completed. No unresolved clarifications. Ready for Phase 1 design and contracts.
