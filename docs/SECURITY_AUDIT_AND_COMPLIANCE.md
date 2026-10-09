# FitPulse — Security Architecture, Audit & Compliance Specification

## 🛡️ Executive Summary

The **FitPulse** Athletic & Clinical Fitness Platform adheres to defense-in-depth engineering principles, OWASP Top 10 mitigation strategies, and zero-trust API design. Security is enforced synchronously across all architectural tiers: the client boundary, API gateway middleware, business service logic, and database persistence layers.

---

## 🔒 1. Authentication Architecture

### 1.1 JSON Web Token (JWT) Lifecycle
- **Algorithm**: HMAC-SHA256 (`HS256`).
- **Token Format**: Standard RFC 7519 Bearer Token in HTTP Authorization header:
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Payload Claims**:
  ```json
  {
    "userId": "usr-sarah-101",
    "email": "sarah@fitpulse.com",
    "role": "USER",
    "iat": 1775712000,
    "exp": 1776316800
  }
  ```
- **Token Verification**:
  - Validated on every incoming protected request via `authenticateToken` middleware (`backend/src/middleware/auth.ts`) and Spring Security `JwtAuthenticationFilter` (`backend/java-spring`).
  - Missing, malformed, or expired tokens immediately trigger `401 Unauthorized` responses before reaching domain controllers.

---

## 👥 2. Role-Based Access Control (RBAC)

FitPulse implements a strict dual-tier RBAC security policy:

| System Role | Authorized Domains & Endpoints | Restricted / Blocked Endpoints | Status Code on Violation |
| :--- | :--- | :--- | :--- |
| **`USER` (Athlete)** | Personal Workouts CRUD, Personal Goals CRUD, Challenge View/Enrollment, Public Approved Guides, Personal Profile | Administrative User Management, System Settings, Content Moderation, Platform Telemetry, Audit Logs | `403 Forbidden` |
| **`ADMIN` (Administrator)** | Full Control Panel, User Directory Search/Edit/Delete, Content Approval/Rejection, Settings Management, Audit Streams, Challenges Admin | Self-Deactivation, Self-Demotion, Self-Deletion (Self-Protection Guards) | `400 Bad Request` |

### 2.1 Backend Middleware Enforcement
- **Node.js**: `requireRole('ADMIN')` (`backend/src/middleware/auth.ts`).
- **Java Spring**: `@PreAuthorize("hasRole('ADMIN')")` and `SecurityFilterChain` matchers.
- **Servlets**: `HttpServletRequest.isUserInRole("ADMIN")` verification before processing administrative commands.

---

## 🔑 3. Cryptographic Password Handling

- **Hashing Algorithm**: **BCrypt** with adaptive cost factor (Salt Rounds = 10).
- **Zero Plaintext Storage**: Plaintext passwords never persist to disk, SQLite, PostgreSQL, or application logs.
- **Registration Pipeline**:
  ```
  User Input (raw password)
        │
        ▼
  bcrypt.genSalt(10)
        │
        ▼
  bcrypt.hash(password, salt) ──► password_hash ($2a$10$...) ──► Database
  ```
- **Authentication Comparison**:
  - Uses constant-time string comparison (`bcrypt.compare()` in Node.js, `BCryptPasswordEncoder.matches()` in Spring) to defeat side-channel timing attacks.

---

## 💉 4. SQL Injection Defense

FitPulse achieves **100% SQL Injection Immunity** through strict architectural mandates:

### 4.1 Node.js / Prisma ORM
- All database operations utilize Prisma's query engine with automatically parameterized SQL statements. No dynamic SQL strings are constructed.

### 4.2 Core Java / Native JDBC Layer
- Every native query in `UserJdbcDao`, `WorkoutJdbcDao`, and `ChallengeJdbcDao` strictly utilizes `java.sql.PreparedStatement` with `?` positional parameters:
  ```java
  // IMMUNE TO SQL INJECTION:
  String sql = "SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER(?) AND is_deleted = false";
  try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setString(1, email.trim());
      try (ResultSet rs = stmt.executeQuery()) { ... }
  }
  ```
- Zero string concatenation (`"WHERE email = '" + email + "'"` is strictly prohibited throughout the codebase).

---

## 🌐 5. Cross-Site Scripting (XSS) & Header Defenses

### 5.1 Frontend React Escaping
- React 19 inherently escapes all dynamic bindings within JSX text nodes (`<div>{userInput}</div>`).
- The entire frontend codebase has **zero instances** of `dangerouslySetInnerHTML`.

### 5.2 HTTP Security Headers
The Express API gateway enforces OWASP security headers on all responses:
- `X-Content-Type-Options: nosniff` — Prevents MIME-sniffing exploits.
- `X-Frame-Options: DENY` — Defends against Clickjacking attacks.
- `X-XSS-Protection: 1; mode=block` — Enables legacy browser XSS filters.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects referral URLs.
- Removal of `X-Powered-By` — Eliminates server technology fingerprinting.

---

## 🔄 6. Cross-Origin Resource Sharing (CORS)

Configured in `backend/src/index.ts`:
- **Allowed Origins**: Explicitly whitelisted local origins (`http://localhost:5173`, `http://localhost:3000`) and the production deployment domain (`https://guvi-java-project.vercel.app`).
- **Allowed Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- **Allowed Headers**: `Content-Type`, `Authorization`, `X-Requested-With`.
- **Credentials**: `credentials: true` enabled for authenticated Bearer token exchanges.

---

## 📋 7. Input Validation & Boundary Sanitization

- **Zod Schema Engine**: Every API endpoint validates incoming requests against schemas defined in `backend/src/schemas/`:
  - Enforces UUID string structures on entity identifiers (`params.id`).
  - Restricts workout duration to positive whole numbers (`1 <= duration_minutes <= 1440`).
  - Enforces enum values (`Intensity`: `LOW`, `MEDIUM`, `HIGH`).
  - Rejects negative durations, out-of-range dates, and oversized payload buffers with `400 Bad Request`.

---

## 🔍 8. Sensitive Data Protection

- **Projection Isolation**: When returning user entities, the database query projections explicitly whitelist only non-sensitive columns:
  ```ts
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    profile_image: true,
    is_active: true,
    created_at: true
  }
  ```
- `password_hash` is never serialized into response JSON envelopes.
- Stack traces are omitted in production environments (`NODE_ENV === 'production'`).

---

## 🔐 9. Secrets & Environment Variable Management

- **Zero Hardcoded Secrets**: Secret keys (`JWT_SECRET`, `DATABASE_URL`, `PORT`) are managed strictly through environment variables.
- **Repository Hygiene**:
  - All `.env`, `.env.local`, and `*.db` files are ignored via `.gitignore`.
  - A comprehensive template is maintained in `backend/.env.example` with setup instructions.
  - Frontend client bundle (`frontend/`) contains zero server secrets or database credentials.

---

## 🛑 10. Administrative Self-Protection Guards

To prevent catastrophic administrative lockouts, dedicated guards are enforced at the service level:
1. **Self-Deletion Guard**: An administrator cannot delete their own user account (`DELETE /api/admin/users/:id`). Attempting to do so returns `400 Bad Request`.
2. **Self-Demotion Guard**: An administrator cannot demote their own role to `USER` (`PATCH /api/admin/users/:id/role`).
3. **Self-Deactivation Guard**: An administrator cannot suspend their own active account status (`PATCH /api/admin/users/:id/status`).

---

## 📜 11. Security Audit Logging & Forensic Telemetry

All critical system state mutations trigger asynchronous audit logging to the `AuditLog` / `ActivityLog` table:
- **Logged Actions**: `USER_LOGIN`, `USER_REGISTER`, `LOG_WORKOUT`, `UPDATE_WORKOUT`, `DELETE_WORKOUT`, `JOIN_CHALLENGE`, `ADMIN_CREATE_USER`, `ADMIN_UPDATE_USER`, `ADMIN_UPDATE_ROLE`, `ADMIN_TOGGLE_USER_STATUS`, `ADMIN_DELETE_USER`, `MODERATE_CONTENT`, `UPDATE_SYSTEM_SETTING`.
- **Captured Metadata**: Actor User ID, Action Enum, IP address, Timestamp, Entity ID, and before/after parameters.
- **Administrative Inspection**: Viewable via the Admin Dashboard's real-time **Activity Monitoring Console** (`GET /api/admin/activity-logs`).
