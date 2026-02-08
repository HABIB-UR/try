# Auth Skill – Secure Authentication

**Name:** `auth-skill`  
**Description:** Implement secure authentication systems including signup, signin, password hashing, JWT tokens, and Better Auth integration. Use for building or auditing auth flows.

---

## Instructions

### Signup Flow
- Validate email and password inputs
- Enforce strong password rules
- Hash passwords before storage
- Prevent duplicate account creation

### Signin Flow
- Verify credentials securely
- Use constant-time password comparison
- Handle authentication errors safely
- Prevent brute-force attacks

### Password Security
- Use industry-standard hashing (bcrypt / argon2)
- Never store plain-text passwords
- Support password reset and rotation
- Protect against timing and rainbow-table attacks

### JWT Handling
- Generate access and refresh tokens
- Sign tokens securely with strong secrets
- Validate token integrity and expiration
- Implement token refresh and revocation logic

### Better Auth Integration
- Configure Better Auth providers correctly
- Use built-in session and token handling
- Align Better Auth flows with custom backend logic
- Follow framework-agnostic integration patterns

---

## Best Practices
- Follow OWASP authentication guidelines
- Never expose sensitive auth errors
- Use HTTPS-only cookies when applicable
- Apply least-privilege access control
- Rotate secrets and tokens regularly

---

## Example Snippets

```ts
// Signup
const hashedPassword = await hash(password);
await createUser({ email, password: hashedPassword });

// Signin
const isValid = await verify(password, user.password);
if (!isValid) throw new AuthError();

// JWT
const accessToken = signJWT({ userId: user.id });
const refreshToken = signRefreshJWT({ userId: user.id });
