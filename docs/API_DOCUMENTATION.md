# FitPulse REST API Specification

Base URLs:
- Node.js Express: `http://localhost:5000/api`
- Java Spring Boot: `http://localhost:8080/api/v1` (and `/api`)

## Authentication & Authorization
All authenticated routes require standard HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

---

### 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Create new athlete account
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token
- `GET /api/auth/me` — Retrieve authenticated profile information
- `PATCH /api/auth/profile` — Update athlete profile parameters & bio
- `POST /api/auth/change-password` — Secure password modification

---

### 2. Workout Management & Analytics (`/api/workouts`)
- `GET /api/workouts` — Paginated workout log retrieval (`?page=1&limit=10&type=STRENGTH&startDate=...&endDate=...`)
- `POST /api/workouts` — Log a new workout session (triggers auto-goal & challenge updates)
- `GET /api/workouts/:id` — Get specific workout detail
- `PUT /api/workouts/:id` — Update workout parameters
- `DELETE /api/workouts/:id` — Delete workout entry
- `GET /api/workouts/analytics` — Real database-aggregated telemetry:
  - Weekly workout hours, weekly calories burned, weekly session count
  - Monthly workout hours, monthly calories burned, monthly session count
  - Total lifetime calories, workouts count, and training hours
  - 7-day rolling daily trend (`calories`, `duration`, `workoutsCount`)
  - Workout category and intensity distributions
  - Live Goal progress summary (active, completed, average completion %)
  - Live Challenge progress summary (enrolled, active, completed, completion rate %)
- `GET /api/workouts/estimate-calories` — Dynamic MET formula calorie estimation

---

### 3. Fitness Goals Endpoints (`/api/goals`)
Full personal milestone CRUD and progress tracking:
- `GET /api/goals` — List athlete fitness goals (optional `?status=IN_PROGRESS|COMPLETED|ABANDONED`)
- `POST /api/goals` — Establish a new personal fitness goal:
  - Payload: `{ title, description, goalType, targetValue, currentValue, unit, targetDate }`
  - Automatically calculates `completionPercentage` and auto-completes when `currentValue >= targetValue`
- `GET /api/goals/:id` — Retrieve goal details by ID (enforces athlete ownership)
- `PUT /api/goals/:id` — Update goal parameters (target, current value, deadline, status)
- `DELETE /api/goals/:id` — Permanently remove a fitness goal
- `POST /api/goals/:id/increment` — Quick progress increment `{ increment: number }`
- `POST /api/goals/:id/abandon` — Mark goal as abandoned

---

### 4. Fitness Challenges & Gamification (`/api/challenges`)
Community endurance quests, holographic medals, and administrative governance:
- **Athlete Operations:**
  - `GET /api/challenges` — List all community challenges with current user enrollment status
  - `POST /api/challenges/:id/join` — Join a challenge (strictly prevents duplicate participation, 400 Bad Request)
  - `POST /api/challenges/:id/progress` — Update user challenge progress `{ current_progress: number }`
  - `GET /api/challenges/my/progress` — Retrieve user's active & completed challenges with earned badges
  - `GET /api/challenges/my/history` — Complete chronological challenge participation history
  - `POST /api/challenges/:id/claim` — Claim XP reward and unlock holographic badge
- **Admin Governance (Role: `ADMIN` required):**
  - `POST /api/challenges/admin/create` — Publish a new community challenge
  - `PUT /api/challenges/admin/:id` — Update challenge target metric, values, or dates
  - `DELETE /api/challenges/admin/:id` — Delete challenge and purge enrollments
  - `GET /api/challenges/admin/:id/monitor` — Live monitor roster: participant list, individual completion %, in-progress vs completed counts, and completion rate

---

### 5. Admin User Management (`/api/admin`)
Requires JWT Bearer token with `ADMIN` role. Athletes attempting access receive `403 Forbidden`.
- `GET /api/admin/dashboard` — Platform cluster statistics and KPI telemetry (total users, workouts, active challenges, system health).
- `GET /api/admin/users` — Paginated user directory with search and filtering:
  - Query parameters: `?search=<name/email>&role=ALL|USER|ADMIN&status=ALL|ACTIVE|SUSPENDED&page=1&limit=10`
  - Returns: `{ users: [...], total, page, limit, totalPages }` with populated `workoutsCount` and normalized `status` ('Active' | 'Suspended').
- `POST /api/admin/users` — Provision a new athlete or administrator account (`{ name, email, password, role }`).
- `PUT /api/admin/users/:id` or `PATCH /api/admin/users/:id` — Update user profile details (`{ name, email, role, is_active }`). Includes admin self-protection against self-demotion or self-deactivation.
- `PATCH /api/admin/users/:id/role` — Fast role elevation or demotion (`{ role: "USER" | "ADMIN" }`).
- `PATCH /api/admin/users/:id/status` — Deactivate or reactivate an account (`{ is_active: boolean }`).
- `DELETE /api/admin/users/:id` — Soft-deletes or purges user account and records security audit trail. Blocked on own admin ID.
- `GET /api/admin/audit-logs` — Administrative security action history log.

---

### 6. Fitness Content Management (`/api/content`)
End-to-end fitness guide publication, review, and public access pipeline.
- **Athlete Operations:**
  - `GET /api/content` — Public / athlete feed. Strictly filters and returns only guides with `status = 'APPROVED'`. Supports category and tag filters.
  - `GET /api/content/my` — Returns the authenticated athlete's submissions across all review states (`PENDING`, `APPROVED`, `REJECTED`) with moderation notes.
  - `POST /api/content` — Submit a workout plan or nutrition guide:
    - Normal athletes create guides with initial status `PENDING`.
    - Administrators publishing guides are auto-assigned `APPROVED`.
  - `GET /api/content/:id` — Detailed view of a fitness guide.
- **Admin Moderation & Governance (Role: `ADMIN` required):**
  - `GET /api/content/admin/all` — Administrative moderation workbench. Retrieves all submissions with optional filter `?status=ALL|PENDING|APPROVED|REJECTED`.
  - `PATCH /api/content/admin/:id/moderate` (also `PUT /api/content/admin/:id/moderate`) — Review and set content state:
    - Payload: `{ status: "APPROVED" | "REJECTED", reviewer_notes?: string, feedback?: string }`
  - `DELETE /api/content/admin/:id` — Permanently purge inappropriate or obsolete fitness guides.

---

### 7. System Settings Management (`/api/admin/settings`)
Database-persisted platform configuration engine.
- `GET /api/admin/settings` — Retrieves all platform parameters stored in the database `SystemSetting` table. Automatically seeds default configuration parameters if table is blank.
- `PUT /api/admin/settings/:key` — Update or upsert an existing parameter value and description.
  - Payload: `{ value: string, description?: string }`
  - Changes are recorded in database and committed to the audit log.
- `POST /api/admin/settings` — Add a new dynamic configuration parameter:
  - Payload: `{ key: string, value: string, description?: string }`

---

### 8. Platform Statistics & Aggregated Telemetry (`/api/admin/statistics`)
Real, database-driven analytical aggregations across all domain models:
- `GET /api/admin/statistics` — Complete platform metrics breakdown:
  - `users`: Total registered, active count, suspended count, regular athletes, administrators, and 30-day growth.
  - `workouts`: Total sessions, cumulative calories burned, total duration hours, average session duration/calories, breakdown by discipline (`byType`: Cardio, Strength, HIIT, Yoga, Cycling, etc.), and intensity split (`byIntensity`: LOW, MEDIUM, HIGH).
  - `challenges`: Total challenges, ongoing quests, total enrollments, completed quests, platform completion rate %, and top community quests leaderboard.
  - `content`: Total guides, approved count, pending review queue, rejected count, and category breakdown.
  - `engagementTrend`: 7-day rolling daily workout volume, calories burned, and unique active athletes.

---

### 9. Activity Monitoring & Security Audit Trail (`/api/admin/activity-logs`)
Immutable audit log recording critical operations across user life-cycle, workouts, challenges, and moderation:
- `GET /api/admin/activity-logs` — Paginated activity log stream:
  - Query parameters: `?page=1&limit=25&action=...&search=...`
  - Returns: `{ logs: [...], pagination: { total, page, limit, totalPages } }`
  - Supported actions: `USER_LOGIN`, `USER_REGISTER`, `LOG_WORKOUT`, `UPDATE_WORKOUT`, `DELETE_WORKOUT`, `JOIN_CHALLENGE`, `UPDATE_CHALLENGE_PROGRESS`, `CHALLENGE_COMPLETED`, `ADMIN_CREATE_USER`, `ADMIN_UPDATE_USER`, `ADMIN_UPDATE_ROLE`, `ADMIN_TOGGLE_USER_STATUS`, `ADMIN_DELETE_USER`, `CREATE_FITNESS_CONTENT`, `MODERATE_CONTENT`, `DELETE_FITNESS_CONTENT`, `UPDATE_SYSTEM_SETTING`.
- `GET /api/admin/activity-stats` — Activity statistics summary (`totalLogs`, `todayCount`, `byAction` frequency map).

---

### 10. Native Jakarta Servlets Endpoints (`/api/v1/servlets/*`)

Direct `HttpServlet` endpoints registered via Spring Boot `ServletRegistrationBean`. Implements the strict flow: `Request → Servlet → Service → JDBC DAO → Database → Response`.

#### 10.1 Workout Servlet (`/api/v1/servlets/workouts`)
- `GET /api/v1/servlets/workouts` — Retrieve user workout logs via raw JDBC `PreparedStatement` (`?limit=20&offset=0`). Returns `200 OK` with JSON array.
- `GET /api/v1/servlets/workouts?id=:id` — Retrieve specific workout session. Returns `200 OK` or `404 Not Found`.
- `POST /api/v1/servlets/workouts` — Log a new workout session via raw JDBC.
  - Payload: `{ "type": "HIIT", "durationMinutes": 45, "intensity": "HIGH", "caloriesBurned": 520, "volumeKg": 800.0, "notes": "Circuit training" }`
  - Returns: `201 Created` with generated primary key ID and persisted record.
- `PUT /api/v1/servlets/workouts?id=:id` — Update existing workout record.
  - Payload: `{ "durationMinutes": 50, "volumeKg": 950.0, "notes": "Adjusted PR" }`
  - Returns: `200 OK` on success, `404 Not Found` if missing.
- `DELETE /api/v1/servlets/workouts?id=:id` — Permanently purge workout log. Returns `200 OK`.

#### 10.2 Goal Servlet (`/api/v1/servlets/goals`)
- `GET /api/v1/servlets/goals` — Retrieve athlete personal milestones. Returns `200 OK`.
- `POST /api/v1/servlets/goals` — Create new fitness goal.
  - Payload: `{ "title": "Caloric Target", "goalType": "CALORIE_BURN", "targetValue": 5000.0, "unit": "kcal" }`
  - Returns: `201 Created`.
- `PUT /api/v1/servlets/goals?id=:id` — Update target value or increment progress. Returns `200 OK`.
- `DELETE /api/v1/servlets/goals?id=:id` — Remove fitness goal. Returns `200 OK`.

#### 10.3 Admin User Servlet (`/api/v1/servlets/admin/users`)
- `GET /api/v1/servlets/admin/users` — Paginated directory listing via JDBC. Returns `200 OK`.
- `POST /api/v1/servlets/admin/users` — Provision new user account with BCrypt password hashing. Returns `201 Created`.
- `PUT /api/v1/servlets/admin/users?id=:id` — Update user details or active toggle. Returns `200 OK`.
- `DELETE /api/v1/servlets/admin/users?id=:id` — Remove user account (enforces self-deletion guard). Returns `200 OK`.

#### 10.4 Challenge Servlet (`/api/v1/servlets/challenges`)
- `GET /api/v1/servlets/challenges` — List community quests and participants. Returns `200 OK`.
- `POST /api/v1/servlets/challenges` — Launch new community challenge. Returns `201 Created`.
- `POST /api/v1/servlets/challenges/enroll` — Enroll athlete into challenge with duplicate participation prevention. Returns `201 Created` or `400 Bad Request`.
- `PUT /api/v1/servlets/challenges?id=:id` — Update challenge parameters. Returns `200 OK`.
- `DELETE /api/v1/servlets/challenges?id=:id` — Archive challenge and enrollments. Returns `200 OK`.



