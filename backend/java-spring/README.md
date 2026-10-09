# FitPulse Enterprise — Core Java & Spring Boot Architecture

**FitPulse Enterprise** is a high-performance clinical wellness, biometric telemetry, and athletic training platform engineered in **Core Java 21** and **Spring Boot 3.3.4**.

This subsystem exemplifies rigorous Object-Oriented Programming (OOP) paradigms, clean 3-tier architectural separation (**Controller → Service → Repository**), polymorphic strategy engines, and enterprise governance.

---

## 1. 🔴 Problem & Solution Design

For the complete technical blueprint, SMART objectives, functional and non-functional specifications, user/admin workflows, and Level 0/1 DFD diagrams, see [PROBLEM_AND_SOLUTION_DESIGN.md](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/docs/PROBLEM_AND_SOLUTION_DESIGN.md).

### Problem Statement
Athletic performance and personal wellness tracking systems face critical engineering flaws:
* **Fragmented Interfaces**: Disconnected tools for workouts, habits, endurance, and guidance create data silos and high user churn.
* **Lack of Real-Time Biomechanics**: Inability to calculate live session volumes, set strikethroughs, and interval rest countdown chimes during training.
* **Inaccurate Calorie Computation**: Flat calorie estimates fail to factor in exercise modalities, scientific MET equivalents, and individual intensity levels.
* **Absence of Governance & Auditing**: Insufficient administrative control over user directories, role elevations (`USER` ↔ `ADMIN`), content moderation, and tamper-resistant activity logging.

### Solution Design
FitPulse provides a unified clinical wellness OS:
1. **Interactive Set-by-Set Logging**: Complete workout telemetry with live volume calculations and automated rest countdown timers.
2. **Polymorphic Metabolic Engine**: Dynamic calorie expenditure estimation adhering to peer-reviewed MET formulas.
3. **Adaptive Goal & Milestone Tracking**: Automated synchronization of user goals with newly logged workouts.
4. **Gamified Achievement Arenas**: Community endurance quests, XP leveling, and commemorative enamel badges.
5. **Role-Based Governance & Audit Trails**: Dedicated administrative KPI telemetry dashboards, athlete management, and immutable audit streams.

---

## 2. 🔴 Core Java Implementation & OOP Principles

The Java implementation adheres strictly to Core Java and enterprise OOP principles:

### 2.1 Object-Oriented Principles

| Principle | Implementation in FitPulse | Key Classes & Interfaces |
| :--- | :--- | :--- |
| **Encapsulation** | Private attributes, validated accessor and mutator methods, defensive copying of collections/dates, domain status transitions. | `User`, `Workout`, `Goal`, `FitnessChallenge`, `ActivityLog` |
| **Abstraction** | Pure contracts isolating business logic from infrastructure; abstract foundational entities defining shared identity and audit metadata. | `BaseEntity`, `Identifiable<ID>`, `Auditable`, `Trackable`, `CalorieCalculable` |
| **Inheritance** | Base entity hierarchy (`BaseEntity`), domain specialization (`WorkoutLog extends Workout`, `Challenge extends FitnessChallenge`), and exception hierarchy. | `BaseEntity`, `WorkoutLog`, `Challenge`, `FitPulseException` |
| **Polymorphism** | Strategy Pattern for dynamic MET calorie calculation; dynamic goal progress evaluation; interface-driven service contracts. | `CalorieCalculationStrategy`, `CalorieStrategyFactory`, `GoalServiceImpl` |

### 2.2 Domain Entities (`com.fitpulse.model`)
The platform is built around 6 core meaningful domain models:
* [User.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/User.java): Athletes and administrators with credentials, roles, total XP, and profile telemetry.
* [Workout.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/Workout.java) & [WorkoutLog.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/WorkoutLog.java): Athletic training sessions with modality, duration, intensity, calories burned, and total volume load ($kg$).
* [Goal.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/Goal.java): Target milestones (calories, workouts, duration, volume) with automated progress updates and percentage completion.
* [Challenge.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/Challenge.java) & [FitnessChallenge.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/FitnessChallenge.java): Community quests with metrics, XP rewards, and enamel badges.
* [FitnessContent.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/FitnessContent.java): Educational articles, routines, and training guides with view counts and upvotes.
* [ActivityLog.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/model/ActivityLog.java): Immutable system and security audit entries recording actor, action type, entity, and timestamp.

### 2.3 Rich Domain Enums (`com.fitpulse.model.enums`)
* `Role`: `USER`, `ADMIN`, `COACH` with Spring Security authority mapping (`getAuthority()`).
* `WorkoutType`: `STRENGTH`, `CARDIO`, `HIIT`, `YOGA`, `CYCLING`, `RUNNING`, `SWIMMING`, `PILATES` with physiological base MET values.
* `Intensity`: `LOW` (0.8x), `MEDIUM` (1.0x), `HIGH` (1.3x) with multiplier factors.
* `GoalType`: `CALORIE_BURN`, `WORKOUT_COUNT`, `DURATION_MINUTES`, `WEIGHT_TARGET`, `VOLUME_KG` with display names and measurement units.
* `GoalStatus`: `IN_PROGRESS`, `COMPLETED`, `ABANDONED` with terminal check helper.
* `ActivityType`: 16 granular event types for domain auditability (`WORKOUT_LOGGED`, `GOAL_COMPLETED`, `ROLE_UPDATED`, etc.).

### 2.4 Polymorphic Strategy Engine (`com.fitpulse.strategy`)
Dynamic calorie calculation evaluates:
$$\text{Calories} = \left(\frac{MET \times 3.5 \times \text{Weight}_{kg}}{200}\right) \times \text{Duration}_{min} \times \text{IntensityFactor} \times \text{ModalityCoeff}$$

* [CalorieCalculationStrategy.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/strategy/CalorieCalculationStrategy.java): Strategy interface.
* [AbstractCalorieStrategy.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/strategy/AbstractCalorieStrategy.java): Template Method class providing standardized calculation.
* Concrete Strategies: `StrengthCalorieStrategy`, `CardioCalorieStrategy`, `HiitCalorieStrategy`, `YogaCalorieStrategy`, `SwimmingCalorieStrategy`, `DefaultCalorieStrategy`.
* [CalorieStrategyFactory.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/strategy/CalorieStrategyFactory.java): Dependency-injected `EnumMap` registry resolving strategies dynamically at runtime.

### 2.5 Generics & Collections
* Generic API wrapper: `ApiResponse<T>` with static factory constructors.
* Generic paginated wrapper: `PagedResponse<T>` supporting any entity/DTO type `T`.
* Generic base repository: `BaseRepository<T, ID>` extending `JpaRepository<T, ID>`.
* Collections: Extensive use of `List<T>`, `Set<T>`, `Map<K, V>`, `EnumMap`, and Java Streams (`filter`, `map`, `groupingBy`, `summingInt`).

### 2.6 Robust Exception Handling (`com.fitpulse.exception`)
* [FitPulseException.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/exception/FitPulseException.java): Abstract root domain runtime exception.
* `ResourceNotFoundException`: HTTP 404 with entity name and ID.
* `BadRequestException`: HTTP 400 for domain rule violations.
* `DuplicateResourceException`: HTTP 409 for unique constraints (e.g., duplicate email).
* `UnauthorizedException`: HTTP 401 for token validation failures.
* [GlobalExceptionHandler.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/exception/GlobalExceptionHandler.java): `@RestControllerAdvice` converting exceptions into structured `ApiResponse<T>` payloads.

---

## 3. Controller → Service → Repository Separation

The system strictly enforces layered separation:

```
[ REST Controller Layer ]
    │  - AuthController, WorkoutController, GoalController,
    │    ChallengeController, ContentController, ActivityLogController, AdminController
    ▼
[ Service Layer Interfaces ]
    │  - IAuthService, IWorkoutService, IGoalService,
    │    IChallengeService, IContentService, IActivityLogService, IAdminService, IAnalyticsService
    ▼
[ Service Implementations (@Service, @Transactional) ]
    │  - Business logic, domain events, polymorphic calculations, audit logging
    ▼
[ Repository Layer (@Repository, BaseRepository<T, ID>) ]
    │  - UserRepository, WorkoutRepository, WorkoutLogRepository, GoalRepository,
    │    FitnessChallengeRepository, UserChallengeRepository, FitnessContentRepository,
    │    ActivityLogRepository, SystemSettingRepository
    ▼
[ Persistence Layer (H2 / PostgreSQL) ]
```

---

## 4. Key REST API Endpoints & Role-Based Access Control

### 4.1 RBAC Enforcement & Status Codes
* **Unauthenticated Requests**: Return **HTTP 401 Unauthorized** with structured JSON via [JwtAuthenticationEntryPoint.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/security/JwtAuthenticationEntryPoint.java).
* **Unauthorized Roles (`USER` accessing Admin APIs)**: Return **HTTP 403 Forbidden** with structured JSON via [CustomAccessDeniedHandler.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/security/CustomAccessDeniedHandler.java).
* **USER Role**: Strictly prohibited from all `/api/v1/admin/**` and audit log endpoints.
* **ADMIN Role**: Granted complete governance over User Management, Content Management, System Settings, Statistics, and Activity Monitoring.

### 4.2 Endpoint Catalog

| Category | Method | Path | Description & Validation | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new athlete account | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT Bearer token | Public |
| **Auth** | `GET` | `/api/v1/auth/me` | Current authenticated athlete profile | Authenticated |
| **Workouts (Create)** | `POST` | `/api/v1/workouts` | Log workout; validates type, duration (1-1440 min), intensity, volume, calories, date/time | Authenticated |
| **Workouts (Read)** | `GET` | `/api/v1/workouts` | Paginated workout telemetry with optional modality filter | Authenticated |
| **Workouts (Read)** | `GET` | `/api/v1/workouts/{id}` | Specific session details by ID | Owner or Admin |
| **Workouts (Update)** | `PUT` | `/api/v1/workouts/{id}` | Update session type, duration, intensity, volume, calories, notes | Owner or Admin |
| **Workouts (Delete)** | `DELETE`| `/api/v1/workouts/{id}`| Remove workout record | Owner or Admin |
| **Workouts (MET)** | `GET` | `/api/v1/workouts/estimate-calories` | Polymorphic MET calorie calculation engine | Authenticated |
| **Goals** | `POST` | `/api/goals` | Create personal fitness milestone goal | Authenticated |
| **Goals** | `GET` | `/api/goals` | List personal active/completed goals | Authenticated |
| **Goals** | `POST` | `/api/goals/{id}/increment` | Increment goal progress | Authenticated |
| **Goals** | `POST` | `/api/goals/{id}/abandon` | Abandon active goal | Authenticated |
| **Challenges** | `GET` | `/api/v1/challenges` | List available community quests | Public |
| **Challenges** | `POST` | `/api/v1/challenges/{id}/join` | Enroll into challenge | Authenticated |
| **Challenges** | `POST` | `/api/v1/challenges/{id}/claim` | Claim completed challenge XP reward | Authenticated |
| **Content** | `GET` | `/api/v1/content` | List approved fitness routine guides | Public |
| **Content** | `POST` | `/api/v1/content` | Submit new routine guide | Authenticated |
| **Activity** | `GET` | `/api/activity-logs/recent` | Top 20 recent activity events | Public |
| **Admin (Users)** | `GET` | `/api/v1/admin/users` | Paginated user directory with search | Admin Only (403 for USER) |
| **Admin (Users)** | `GET` | `/api/v1/admin/users/{id}` | User account detail by ID | Admin Only (403 for USER) |
| **Admin (Users)** | `PATCH`| `/api/v1/admin/users/{id}/role` | Elevate / demote user role (`USER`, `ADMIN`, `COACH`) | Admin Only (403 for USER) |
| **Admin (Users)** | `PATCH`| `/api/v1/admin/users/{id}/status`| Toggle active / suspended account state | Admin Only (403 for USER) |
| **Admin (Users)** | `DELETE`| `/api/v1/admin/users/{id}`| Soft-delete / deactivate athlete account | Admin Only (403 for USER) |
| **Admin (Content)** | `GET` | `/api/v1/admin/content` | Content guides across all moderation states | Admin Only (403 for USER) |
| **Admin (Content)** | `POST` | `/api/v1/admin/content/{id}/moderate`| Approve / reject guide submission | Admin Only (403 for USER) |
| **Admin (Content)** | `DELETE`| `/api/v1/admin/content/{id}`| Archive / delete guide | Admin Only (403 for USER) |
| **Admin (Settings)**| `GET` | `/api/v1/admin/settings` | Inspect all system configuration keys | Admin Only (403 for USER) |
| **Admin (Settings)**| `POST` | `/api/v1/admin/settings` | Calibrate runtime parameter key/value | Admin Only (403 for USER) |
| **Admin (Stats)** | `GET` | `/api/v1/admin/dashboard` | Administrator KPI telemetry | Admin Only (403 for USER) |
| **Admin (Stats)** | `GET` | `/api/v1/admin/statistics` | Detailed platform statistics and metrics | Admin Only (403 for USER) |
| **Admin (Audit)** | `GET` | `/api/v1/admin/activity-logs` | Immutable audit stream with pagination | Admin Only (403 for USER) |

---

---

## 5. 🔴 JDBC / Database Layer (`com.fitpulse.jdbc`)

The backend integrates native Java JDBC alongside Spring Data JPA, executing direct SQL statements with explicit resource lifecycle control and ACID transactions without altering or breaking existing database tables.

### 5.1 Native JDBC Architecture & Components

| Component | Responsibility | Implementation Highlights |
| :--- | :--- | :--- |
| [JdbcConnectionManager.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/jdbc/JdbcConnectionManager.java) | Connection Pooling & Transaction Lifecycle | Manages `java.sql.Connection` acquisition from the Spring `DataSource`; provides `<T> executeInTransaction(callback)` executing atomic blocks with automatic commit and rollback. |
| [UserJdbcDao.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/jdbc/UserJdbcDao.java) | User CRUD & XP Management | Full CRUD operations using parameterized `PreparedStatement`, `Statement.RETURN_GENERATED_KEYS`, and `ResultSet` mapping. |
| [WorkoutJdbcDao.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/jdbc/WorkoutJdbcDao.java) | Workout CRUD & Multi-Table Transaction | Full CRUD; implements `createWorkoutWithXpTransaction` executing atomic multi-table transaction (insert workout + update user XP) with explicit `commit()` and `rollback()`. |
| [ChallengeJdbcDao.java](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/backend/java-spring/src/main/java/com/fitpulse/jdbc/ChallengeJdbcDao.java) | Challenge CRUD & Atomic Enrollment | Full CRUD; implements `enrollUserInChallengeWithTransaction` executing atomic transaction (duplicate check + insert enrollment + insert audit log). |

### 5.2 Key JDBC Guarantees
1. **Zero SQL Injection**: Strict use of parameterized `PreparedStatement` with bound placeholders (`?`) everywhere. No string concatenation is permitted in SQL construction.
2. **Proper Resource Management**: Try-with-resources blocks on all `Connection`, `PreparedStatement`, and `ResultSet` instances prevent database connection leaks.
3. **Explicit ACID Transactions**:
   ```java
   Connection conn = connectionManager.getConnection();
   try {
       conn.setAutoCommit(false); // Begin Transaction
       // Statement 1: Insert workout record
       // Statement 2: Credit user total XP
       conn.commit();             // Commit Transaction
   } catch (SQLException ex) {
       conn.rollback();           // Rollback Transaction on Error
       throw ex;
   } finally {
       conn.close();
   }
   ```

---

## 6. 🔴 Servlets & Web Integration (`com.fitpulse.servlet`)

The platform integrates native Java `HttpServlet` endpoints registered directly within the Spring Boot embedded Tomcat container via `ServletRegistrationBean`.

### 6.1 End-to-End Architectural Flow
```
┌──────────────┐     ┌───────────────┐     ┌─────────────────────┐     ┌─────────────────┐     ┌──────────┐
│ HTTP Request │ ──► │  HttpServlet  │ ──► │     JDBC Service    │ ──► │    JDBC DAO     │ ──► │ Database │
│ (GET/POST/..)│     │ (User/Workout/│     │ (UserJdbcService/   │     │ (PreparedStatement│   │ (H2/PG)  │
│              │     │  Challenge)   │     │  WorkoutJdbcService)│     │  ACID Tx Commit)│     │          │
└──────────────┘     └───────────────┘     └─────────────────────┘     └─────────────────┘     └──────────┘
       ▲                     │                        │                         │                   │
       │                     ▼                        ▼                         ▼                   │
┌──────────────┐     ┌───────────────┐     ┌─────────────────────┐     ┌─────────────────┐          │
│ JSON Output  │ ◄── │ JSON Envelope │ ◄── │    Domain Model     │ ◄── │    ResultSet    │ ◄────────┘
│ + Status Code│     │ (ObjectMapper)│     │    (User/Workout)   │     │  (Mapped Entity)│
└──────────────┘     └───────────────┘     └─────────────────────┘     └─────────────────┘
```

### 6.2 Servlet API Reference

| Servlet | Method | URL Pattern | Description | Sample Query / Body |
| :--- | :--- | :--- | :--- | :--- |
| **UserServlet** | `GET` | `/servlet/users` | List paginated users | `?limit=20&offset=0` |
| **UserServlet** | `GET` | `/servlet/users/{id}` | Get single user by ID | Path parameter `{id}` |
| **UserServlet** | `POST` | `/servlet/users` | Register athlete via JDBC | `{"name":"Alex","email":"alex@fit.local","password":"pass123","role":"USER"}` |
| **UserServlet** | `PUT` | `/servlet/users/{id}` | Update athlete profile | `{"name":"Alex Mercer","role":"ADMIN"}` |
| **UserServlet** | `DELETE`| `/servlet/users/{id}` | Soft delete athlete record | Path parameter `{id}` |
| **WorkoutServlet** | `GET` | `/servlet/workouts` | List paginated workouts | `?limit=50&offset=0` |
| **WorkoutServlet** | `GET` | `/servlet/workouts/{id}` | Get workout session by ID | Path parameter `{id}` |
| **WorkoutServlet** | `GET` | `/servlet/workouts?userId={id}` | Get athlete workout history | `?userId=1` |
| **WorkoutServlet** | `POST` | `/servlet/workouts` | Log workout + Award XP (ACID Tx) | `{"userId":1,"workoutType":"HIIT","durationMinutes":45,"intensity":"HIGH","xpAward":50}` |
| **WorkoutServlet** | `PUT` | `/servlet/workouts/{id}` | Update workout telemetry | `{"durationMinutes":50,"caloriesBurned":480}` |
| **WorkoutServlet** | `DELETE`| `/servlet/workouts/{id}` | Delete workout record | Path parameter `{id}` |
| **ChallengeServlet** | `GET` | `/servlet/challenges` | List all fitness challenges | None |
| **ChallengeServlet** | `GET` | `/servlet/challenges/active` | List active open challenges | None |
| **ChallengeServlet** | `GET` | `/servlet/challenges/{id}` | Get challenge details | Path parameter `{id}` |
| **ChallengeServlet** | `POST`| `/servlet/challenges` | Create new challenge | `{"title":"Century Run","targetMetric":"TOTAL_DISTANCE_KM","targetValue":100,"rewardXp":500}` |
| **ChallengeServlet** | `POST`| `/servlet/challenges/{id}/enroll` | Enroll athlete in challenge (ACID Tx)| `{"userId":1}` |
| **ChallengeServlet** | `PUT` | `/servlet/challenges/{id}` | Update challenge parameters | `{"targetValue":120,"rewardXp":600}` |
| **ChallengeServlet** | `DELETE`| `/servlet/challenges/{id}`| Soft delete challenge | Path parameter `{id}` |

---

## 7. Seed Accounts & Verification

* **Athlete**: `sarah@fitpulse.com` / `User123!` (Workouts, goals, active challenges preloaded)
* **Administrator**: `admin@fitpulse.com` / `Admin123!` (Full platform governance and moderation)

### Running Application
```bash
mvn clean spring-boot:run
```
* **Swagger UI Documentation**: `http://localhost:8080/swagger-ui.html`
* **Embedded H2 Database Console**: `http://localhost:8080/h2-console` (`jdbc:h2:mem:fitpulsedb`)
* **Native Servlet Endpoints**: `http://localhost:8080/servlet/users`, `http://localhost:8080/servlet/workouts`, `http://localhost:8080/servlet/challenges`

