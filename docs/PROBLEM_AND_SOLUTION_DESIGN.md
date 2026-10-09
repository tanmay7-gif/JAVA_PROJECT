# FitPulse Platform — Problem & Solution Design Specification

**Document Version:** 2.0.0  
**Status:** Approved for Implementation & Architecture Assessment  
**Audience:** Software Engineers, System Architects, Quality Assurance, Product Evaluators  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Functional Requirements (FR)](#4-functional-requirements-fr)
5. [Non-Functional Requirements (NFR)](#5-non-functional-requirements-nfr)
6. [Actor Profiles & RBAC Matrix](#6-actor-profiles--rbac-matrix)
7. [Comprehensive Workflows & Journey Maps](#7-comprehensive-workflows--journey-maps)
   - [7.1 Athlete User Workflows](#71-athlete-user-workflows)
   - [7.2 Administrator Governance Workflows](#72-administrator-governance-workflows)
8. [System Architecture Specification](#8-system-architecture-specification)
   - [8.1 Layered 3-Tier Enterprise Architecture](#81-layered-3-tier-enterprise-architecture)
   - [8.2 Controller-Service-Repository Pattern](#82-controller-service-repository-pattern)
   - [8.3 Architectural Diagram](#83-architectural-diagram)
9. [Data-Flow Documentation (DFD)](#9-data-flow-documentation-dfd)
   - [9.1 DFD Level 0 (Context Diagram)](#91-dfd-level-0-context-diagram)
   - [9.2 DFD Level 1 (Subsystem Decomposed Data Flow)](#92-dfd-level-1-subsystem-decomposed-data-flow)
   - [9.3 Sequence Diagrams](#93-sequence-diagrams)
10. [Database Entity Relationship Specification (ERD)](#10-database-entity-relationship-specification-erd)
11. [Core Java OOP Architectural Alignment](#11-core-java-oop-architectural-alignment)
12. [JDBC / Database Architecture & ACID Transactions](#12-jdbc--database-architecture--acid-transactions)
13. [Java Servlets & Web Integration](#13-java-servlets--web-integration)

---

## 1. Executive Summary

**FitPulse** is an enterprise-grade athletic telemetry, clinical wellness, and interactive workout tracking platform. The system bridges the divide between fragmented, isolated fitness tracking utilities and rigorous athletic performance engineering. FitPulse combines real-time set-by-set protocol logging, physiological metabolic calorie estimation via scientific MET algorithms, adaptive milestone goal tracking, gamified quest arenas, and an auditable administrative governance infrastructure.

---

## 2. Problem Statement

Modern athletic tracking and personal fitness management software suffers from critical systemic deficiencies:

1. **Fragmented & Disconnected Tracking Interfaces**:
   Athletes typically toggle between multiple isolated applications—one for logging weights and repetitions, another for endurance GPS or cardio, a third for habit/streak tracking, and disparate web forums for instructional cues. This fragmented ecosystem leads to data silos, friction, and an alarming 68% 30-day user attrition rate.

2. **Absence of Real-Time Biomechanical & Set-by-Set Ergonomics**:
   Existing fitness tools rely heavily on retrospective text inputs after a training session has completed. During an active resistance training session, athletes need live set volume calculations, automated rest intervals with audible chime cues, and instantaneous form cue references to prevent musculoskeletal injury.

3. **Inaccurate, Static Calorie & Metabolic Approximations**:
   The vast majority of consumer trackers apply simplistic flat rates (e.g., standard 300 kcal/hr) regardless of exercise modality (e.g., Olympic Weightlifting vs. HIIT vs. Calisthenics vs. Vinyasa Yoga) or individual training intensity factors. There is a lack of polymorphic metabolic calculation models incorporating scientific MET (Metabolic Equivalent of Task) coefficients.

4. **Lack of Adaptive Habit Loops and Gamified Community Incentives**:
   Without tangible micro-rewards, leveling mechanics (XP), and dynamic quest challenges (e.g., "The Century Press", "Consistency King"), athletes quickly lose momentum and lapse in consistency.

5. **Deficiency in Administrative Governance, Auditability & Moderation**:
   Platform managers frequently lack centralized administrative dashboards to audit platform telemetry, moderate user-submitted content, inspect athlete health histories, enforce role-based access control (RBAC), or view auditable event logs for compliance and safety.

---

## 3. Project Objectives

The FitPulse platform resolves these challenges through clear, quantifiable business and technical objectives:

* **Objective 1 — Unified Ergonomic Logging**: Deliver an interactive set-by-set workout logger featuring one-touch set completion, live volume aggregations, interactive rest timers with auditory alerts, and integrated technique cues.
* **Objective 2 — Scientific Metabolic Engine**: Implement polymorphic calorie calculation engines adhering to scientific MET equations dynamically parameterized by workout modality, intensity level, duration, and biometric mass.
* **Objective 3 — Gamification & Habit Formation**: Establish an achievement arena supporting weekly quests, XP leveling tiers (e.g., Iron Athlete, Peak Performer), 7-day consistency streaks, and commemorative enamel badges.
* **Objective 4 — Adaptive Goal Progression**: Enable athletes to establish quantifiable targets (calories burned, weekly session frequency, target duration, volume load) with automated real-time progress recalculation upon workout submission.
* **Objective 5 — Enterprise Governance & Auditability**: Provide a secure administrative control panel equipped with platform telemetry KPIs, a filterable user directory with role promotion/demotion, content moderation pipelines, and immutable activity audit logs.
* **Objective 6 — Clean Software Engineering & OOP Excellence**: Architect the backend utilizing pure Object-Oriented Programming (OOP) paradigms in Core Java / Spring Boot—featuring strict Encapsulation, Abstraction, Inheritance, Polymorphic Strategy Engines, Generic containers, rich Enums, and robust 3-tier Layered Separation (Controller → Service → Repository).

---

## 4. Functional Requirements (FR)

### Module 1: Identity & Role-Based Access Control (RBAC)
* **FR-1.1**: The system shall allow new athletes to register using email, display name, and a secure password (minimum 8 characters with alphanumeric and special character constraints).
* **FR-1.2**: The system shall verify credentials, issue signed, stateless JSON Web Tokens (JWT) upon successful authentication, and maintain role claims (`USER`, `ADMIN`, `COACH`).
* **FR-1.3**: The system shall secure sensitive endpoints, returning HTTP `401 Unauthorized` for missing/invalid tokens and HTTP `403 Forbidden` for insufficient role privileges.
* **FR-1.4**: Users shall be able to inspect and update their athlete profile, including biometric parameters, display avatar URL, and personal fitness bio.

### Module 2: Interactive Workout Logging & Calorie Calculation
* **FR-2.1**: The system shall support logging workout sessions across distinct modalities (`STRENGTH`, `CARDIO`, `CALISTHENICS`, `HIIT`, `YOGA`, `PILATES`, `SWIMMING`).
* **FR-2.2**: The workout logger shall capture duration (minutes), intensity level (`LOW`, `MODERATE`, `HIGH`, `EXTREME`), total volume load (kg), and optional execution notes.
* **FR-2.3**: The system shall provide an automated calorie estimation endpoint that calculates estimated energy expenditure using polymorphic MET algorithms based on exercise type and intensity.
* **FR-2.4**: Upon workout persistence, the system shall automatically trigger progress evaluations for active user challenges and open user fitness goals.
* **FR-2.5**: The system shall allow users to retrieve their paginated historical workout logs, filterable by date range and workout modality.

### Module 3: Fitness Goals & Milestone Tracking
* **FR-3.1**: Users shall be able to create fitness goals defining a title, description, goal type (`CALORIE_BURN`, `WORKOUT_COUNT`, `DURATION_MINUTES`, `WEIGHT_TARGET`, `VOLUME_KG`), target numeric value, and target completion date.
* **FR-3.2**: The system shall automatically evaluate progress increments whenever corresponding workouts or activities are logged.
* **FR-3.3**: The system shall compute percentage completion and transition status from `IN_PROGRESS` to `COMPLETED` when the target value is attained or exceeded.
* **FR-3.4**: Users shall be able to update, pause, or abandon active goals.

### Module 4: Challenges, Quests & Achievement Arenas
* **FR-4.1**: The platform shall maintain a catalog of community endurance and strength challenges (`FitnessChallenge`) with defined target metrics, duration thresholds, and XP rewards.
* **FR-4.2**: Users shall be able to enroll into open challenges, instantiating a personal `UserChallenge` tracking record.
* **FR-4.3**: The system shall automatically increment challenge progress upon matching logged workouts and unlock reward claiming once 100% completion is reached.
* **FR-4.4**: Users claiming completed challenge rewards shall receive instant profile XP credits and unlock corresponding achievement badges.

### Module 5: Curated Educational & Workout Content
* **FR-5.1**: The system shall serve educational fitness articles, exercise technique breakdowns, and video training routines (`FitnessContent`).
* **FR-5.2**: Content shall support editorial lifecycles (`DRAFT`, `PUBLISHED`, `ARCHIVED`) and category classifications.
* **FR-5.3**: Content items shall record read-time estimations, view counts, and author attributions.

### Module 6: System Activity & Security Audit Logging
* **FR-6.1**: The system shall automatically record critical security, administrative, and domain events into an immutable `ActivityLog` repository.
* **FR-6.2**: Each log entry shall record the actor (user ID and email), activity type (`WORKOUT_LOGGED`, `GOAL_COMPLETED`, `ROLE_UPDATED`, etc.), target entity details, client IP address, and precision timestamp.
* **FR-6.3**: Administrators shall have dedicated access to inspect and filter the platform audit log stream.

### Module 7: Administrative Governance & Platform Telemetry
* **FR-7.1**: Administrators shall access a centralized governance dashboard displaying key performance indicators (total athletes, daily workout volume, pending moderation tasks, system health).
* **FR-7.2**: Administrators shall search, inspect, promote, demote (`USER` ↔ `ADMIN`), or suspend/reactivate user accounts.
* **FR-7.3**: Administrators shall be capable of creating, editing, publishing, and archiving challenges and content.
* **FR-7.4**: Administrators shall manage global runtime parameters (`SystemSetting`) such as maintenance mode toggles and feature flags.

---

## 5. Non-Functional Requirements (NFR)

| ID | Category | Requirement Specification | Metric / Verification |
| :--- | :--- | :--- | :--- |
| **NFR-1** | **Performance** | API endpoint response time under standard load shall not exceed 150ms for 95% of requests. | Measured via load testing with JMeter / automated suites. |
| **NFR-2** | **Scalability** | The backend architecture shall remain stateless, supporting horizontal scaling behind load balancers with externalized database persistence. | Stateless JWT token validation; connection pooling. |
| **NFR-3** | **Security** | Passwords hashed using BCrypt (cost factor 10). Transport security via HTTPS / TLS 1.3. CORS origin restriction and parameter sanitization against injection attacks. | OWASP Top 10 compliance; automated security filter verification. |
| **NFR-4** | **Data Integrity** | Multi-table mutations (e.g., logging a workout, updating goals, incrementing challenges, creating audit logs) must execute inside atomic transactions (`@Transactional`). | ACID compliance with automatic rollback on runtime exceptions. |
| **NFR-5** | **Maintainability** | Strict adherence to SOLID principles, Controller → Service → Repository design, polymorphic strategy engines, and 100% clean OOP encapsulation. | Static code analysis; clean class separation. |
| **NFR-6** | **Availability & Resilience** | System must handle database disconnections gracefully, return structured JSON error payloads, and avoid unhandled 500 stack traces exposed to clients. | Global `@RestControllerAdvice` exception handlers covering all checked/runtime exceptions. |

---

## 6. Actor Profiles & RBAC Matrix

### Actor Profiles
1. **Athlete (Role: `USER`)**: End user tracking personal fitness, setting goals, logging exercises, participating in community quests, and viewing physiological charts.
2. **Administrator (Role: `ADMIN`)**: System overseer managing platform telemetry, governing user roles, moderating content, maintaining system configuration, and inspecting audit trails.
3. **Coach / Instructor (Role: `COACH`)**: Verified practitioner authoring fitness routines, educational articles, and customized challenge tracks.

### RBAC Permission Matrix

| Operation / Endpoint | Athlete (`USER`) | Coach (`COACH`) | Administrator (`ADMIN`) |
| :--- | :---: | :---: | :---: |
| Authenticate & Profile Management | ✅ | ✅ | ✅ |
| Workout CRUD (Personal Sessions) | ✅ | ✅ | ✅ (All) |
| Manage Personal Goals & Milestones | ✅ | ✅ | ✅ |
| Enroll in Challenges & Claim XP | ✅ | ✅ | ✅ |
| View Published Content Library | ✅ | ✅ | ✅ |
| Author & Edit Fitness Content | ❌ | ✅ | ✅ |
| Access Admin Operations Dashboard & Stats | ❌ | ❌ | ✅ |
| Manage User Directory & Change Roles | ❌ | ❌ | ✅ |
| Moderate Content Guides (Approve/Reject) | ❌ | ❌ | ✅ |
| Suspend / Activate User Accounts | ❌ | ❌ | ✅ |
| Inspect System Activity & Audit Logs | ❌ | ❌ | ✅ |
| Configure Global Platform Settings | ❌ | ❌ | ✅ |

### 6.1 Authentication & Authorization Error Contracts

The platform strictly enforces standardized RFC HTTP status codes across the entire API surface:

* **HTTP 401 Unauthorized**:
  - Returned whenever a request attempts to access an authenticated or role-restricted endpoint without credentials, or with missing, expired, malformed, or invalid tokens.
  - Handled in Spring Boot via `JwtAuthenticationEntryPoint` and in Express via `authenticateToken`.
  - Structured response payload:
    ```json
    {
      "success": false,
      "status": 401,
      "error": "Unauthorized",
      "message": "Full authentication is required to access this resource. Please supply a valid Bearer token.",
      "path": "/api/v1/admin/dashboard",
      "timestamp": "2026-10-09T09:30:00"
    }
    ```

* **HTTP 403 Forbidden**:
  - Returned whenever an authenticated client attempts to invoke an endpoint that requires elevated privileges (e.g., an Athlete with role `USER` attempting to invoke any endpoint under `/api/v1/admin/**` or `/api/activity-logs`).
  - Handled in Spring Boot via `CustomAccessDeniedHandler` and in Express via `requireRole('ADMIN')`.
  - Structured response payload:
    ```json
    {
      "success": false,
      "status": 403,
      "error": "Forbidden",
      "message": "Access denied: You do not possess the required permissions or role (e.g. ROLE_ADMIN) to access this administrative resource.",
      "path": "/api/v1/admin/users",
      "timestamp": "2026-10-09T09:30:00"
    }
    ```

---

## 7. Comprehensive Workflows & Journey Maps

### 7.1 Athlete User Workflows

#### Workflow 1.1: Registration, Authentication & Profile Setup
```mermaid
sequenceDiagram
    actor Athlete as Athlete (User)
    participant Client as Frontend Client
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant UserRepo as UserRepository
    participant AuditSvc as ActivityLogService

    Athlete->>Client: Enters Registration Details (Name, Email, Password)
    Client->>AuthCtrl: POST /api/auth/register
    AuthCtrl->>AuthSvc: register(RegisterRequest)
    AuthSvc->>UserRepo: existsByEmail(email)
    alt Email already registered
        UserRepo-->>AuthSvc: true
        AuthSvc-->>AuthCtrl: throws DuplicateResourceException
        AuthCtrl-->>Client: 409 Conflict (Email in use)
    else Email available
        UserRepo-->>AuthSvc: false
        AuthSvc->>AuthSvc: Hash password with BCrypt
        AuthSvc->>UserRepo: save(newUser)
        UserRepo-->>AuthSvc: persisted User
        AuthSvc->>AuditSvc: logActivity(USER_REGISTERED)
        AuthSvc->>AuthSvc: Generate JWT Bearer Token
        AuthSvc-->>AuthCtrl: AuthResponse(Token, UserDto)
        AuthCtrl-->>Client: 201 Created (Token + Athlete Profile)
        Client-->>Athlete: Redirects to Athlete Telemetry Dashboard
    end
```

#### Workflow 1.2: Workout Logging & Automated Goal/Challenge Synchronization
```mermaid
sequenceDiagram
    actor Athlete as Athlete
    participant Client as Workout Logger UI
    participant WorkoutCtrl as WorkoutController
    participant WorkoutSvc as WorkoutService
    participant Strategy as CalorieStrategyFactory
    participant GoalSvc as GoalService
    participant ChallengeSvc as ChallengeService
    participant ActivitySvc as ActivityLogService

    Athlete->>Client: Completes Sets & clicks "Log Workout Session"
    Client->>WorkoutCtrl: POST /api/workouts (type, duration, intensity, volume, notes)
    WorkoutCtrl->>WorkoutSvc: logWorkout(WorkoutCreateRequest)
    WorkoutSvc->>Strategy: getStrategy(workoutType)
    Strategy-->>WorkoutSvc: CalorieCalculationStrategy implementation
    WorkoutSvc->>WorkoutSvc: strategy.calculateCalories(...)
    WorkoutSvc->>WorkoutSvc: workoutRepository.save(newWorkout)
    par Goal Evaluation
        WorkoutSvc->>GoalSvc: evaluateGoalsAfterWorkout(user, workout)
        GoalSvc->>GoalSvc: updateProgress() & check completion
    and Challenge Evaluation
        WorkoutSvc->>ChallengeSvc: processWorkoutForChallenges(user, workout)
        ChallengeSvc->>ChallengeSvc: increment userChallenge progress
    and Audit Logging
        WorkoutSvc->>ActivitySvc: logActivity(WORKOUT_LOGGED)
    end
    WorkoutSvc-->>WorkoutCtrl: WorkoutResponse
    WorkoutCtrl-->>Client: 200 OK (Saved Workout + Updated Stats)
    Client-->>Athlete: Displays Volume Stats & Rest Chime
```

---

### 7.2 Administrator Governance Workflows

#### Workflow 2.1: User Directory Moderation & Role Promotion
```mermaid
sequenceDiagram
    actor Admin as System Administrator
    participant AdminUI as Admin Control Panel
    participant AdminCtrl as AdminController
    participant AdminSvc as AdminService
    participant UserRepo as UserRepository
    participant AuditSvc as ActivityLogService

    Admin->>AdminUI: Navigates to User Directory & selects Athlete
    AdminUI->>AdminCtrl: GET /api/admin/users?search=sarah
    AdminCtrl->>AdminSvc: getUsers(search, pageable)
    AdminSvc->>UserRepo: findAll(Specification)
    UserRepo-->>AdminSvc: Page<User>
    AdminSvc-->>AdminCtrl: Page<UserSummaryDto>
    AdminCtrl-->>AdminUI: 200 OK (Athletes Directory)
    
    Admin->>AdminUI: Clicks "Promote to ADMIN"
    AdminUI->>AdminCtrl: PATCH /api/admin/users/{id}/role (role="ADMIN")
    AdminCtrl->>AdminSvc: updateUserRole(userId, newRole)
    AdminSvc->>UserRepo: findById(userId)
    UserRepo-->>AdminSvc: User entity
    AdminSvc->>AdminSvc: user.setRole(Role.ADMIN)
    AdminSvc->>UserRepo: save(user)
    AdminSvc->>AuditSvc: logActivity(ROLE_UPDATED, "Promoted user to ADMIN")
    AdminSvc-->>AdminCtrl: Updated UserDto
    AdminCtrl-->>AdminUI: 200 OK (Role Updated)
    AdminUI-->>Admin: Displays "User Elevated to Administrator" Notification
```

---

## 8. System Architecture Specification

### 8.1 Layered 3-Tier Enterprise Architecture
FitPulse is designed according to the classical, proven enterprise 3-tier model:

1. **Presentation Layer (Tier 1)**:
   - Modern Single Page Application (SPA) built with React 19, TypeScript, Vite, Three.js 3D micro-canvases, and Tailwind CSS.
   - Communicates asynchronously via RESTful HTTP JSON APIs protected with JWT Bearer tokens.
   - Optional Server-Side Rendered (SSR) Thymeleaf templates for internal administrative console backup.

2. **Application / Business Logic Layer (Tier 2)**:
   - Implemented in **Spring Boot 3.3.4 (Java 21)**.
   - Enforces business rules, transactions (`@Transactional`), security filtering, validation (`jakarta.validation`), and algorithmic domain logic.
   - Structured with pure Object-Oriented principles: Polymorphic Strategy engines, Generic DTO envelopes, and interface-based decoupling.

3. **Persistence & Database Layer (Tier 3)**:
   - Object-Relational Mapping (ORM) provided by Spring Data JPA and Hibernate 6.
   - Universal dual-database support: Zero-setup local SQLite / embedded H2 database for rapid development and enterprise PostgreSQL for cloud deployment.
   - Indexed schema design ensuring $O(\log n)$ lookup times for user queries, session telemetry, and audit streams.

---

### 8.2 Controller-Service-Repository Pattern
The backend strictly adheres to the clean separation of concerns:

```
[ HTTP Client Request ]
         │
         ▼
[ @RestController ]  ─── DTO Validation (@Valid) & Request Mapping
         │
         ▼ (Invokes via Interface: e.g., IWorkoutService)
[ @Service Implementation ]  ─── Business Logic, Polymorphic Strategy Engine,
         │                        Security Context, Transaction Boundaries (@Transactional)
         ▼ (Invokes via Interface: e.g., WorkoutRepository)
[ @Repository ]  ─── Spring Data JPA Database Queries & Object Mapping
         │
         ▼
[ Relational Database (SQLite / H2 / PostgreSQL) ]
```

---

### 8.3 Architectural Diagram

```mermaid
graph TD
    subgraph Client_Layer ["Client Presentation Layer"]
        UI_SPA["React 19 / TypeScript SPA (Vite + Tailwind)"]
        UI_3D["Three.js / Anatomical Telemetry"]
        UI_SSR["Thymeleaf Admin Console"]
    end

    subgraph Gateway_Security ["API Security & Gateway"]
        CORS_FILTER["CorsFilter (Origin Whitelist)"]
        JWT_FILTER["JwtAuthenticationFilter (Stateless Bearer)"]
        EX_HANDLER["GlobalExceptionHandler (@RestControllerAdvice)"]
    end

    subgraph Controller_Layer ["REST Controller Layer"]
        AUTH_CTRL["AuthController"]
        WORKOUT_CTRL["WorkoutController"]
        GOAL_CTRL["GoalController"]
        CHALLENGE_CTRL["ChallengeController"]
        CONTENT_CTRL["ContentController"]
        ACTIVITY_CTRL["ActivityLogController"]
        ADMIN_CTRL["AdminController"]
        ANALYTICS_CTRL["AnalyticsController"]
    end

    subgraph Service_Layer ["Decoupled Service Layer (Interfaces & Implementations)"]
        I_AUTH["IAuthService / AuthServiceImpl"]
        I_WORKOUT["IWorkoutService / WorkoutServiceImpl"]
        I_GOAL["IGoalService / GoalServiceImpl"]
        I_CHALLENGE["IChallengeService / ChallengeServiceImpl"]
        I_CONTENT["IContentService / ContentServiceImpl"]
        I_ACTIVITY["IActivityLogService / ActivityLogServiceImpl"]
        I_ADMIN["IAdminService / AdminServiceImpl"]
        I_ANALYTICS["IAnalyticsService / AnalyticsServiceImpl"]
    end

    subgraph Domain_Engine ["Core Domain & Polymorphic Engines"]
        STRATEGY_FAC["CalorieStrategyFactory"]
        STRAT_STRENGTH["StrengthCalorieStrategy"]
        STRAT_CARDIO["CardioCalorieStrategy"]
        STRAT_HIIT["HiitCalorieStrategy"]
        STRAT_CALISTH["CalisthenicsCalorieStrategy"]
        STRAT_YOGA["YogaCalorieStrategy"]
        GOAL_EVAL["GoalEvaluationStrategy"]
    end

    subgraph Repository_Layer ["Spring Data JPA Repository Layer"]
        USER_REPO["UserRepository"]
        WORKOUT_REPO["WorkoutRepository"]
        GOAL_REPO["GoalRepository"]
        CHALLENGE_REPO["FitnessChallengeRepository"]
        USER_CHALL_REPO["UserChallengeRepository"]
        CONTENT_REPO["FitnessContentRepository"]
        ACTIVITY_REPO["ActivityLogRepository"]
        SETTING_REPO["SystemSettingRepository"]
    end

    subgraph Storage_Layer ["Persistence Layer"]
        DB[(Relational DB: SQLite / H2 / PostgreSQL)]
    end

    %% Client to Security
    UI_SPA --> CORS_FILTER
    UI_3D --> CORS_FILTER
    UI_SSR --> CORS_FILTER
    CORS_FILTER --> JWT_FILTER
    JWT_FILTER --> AUTH_CTRL & WORKOUT_CTRL & GOAL_CTRL & CHALLENGE_CTRL & CONTENT_CTRL & ACTIVITY_CTRL & ADMIN_CTRL & ANALYTICS_CTRL

    %% Controllers to Services
    AUTH_CTRL --> I_AUTH
    WORKOUT_CTRL --> I_WORKOUT
    GOAL_CTRL --> I_GOAL
    CHALLENGE_CTRL --> I_CHALLENGE
    CONTENT_CTRL --> I_CONTENT
    ACTIVITY_CTRL --> I_ACTIVITY
    ADMIN_CTRL --> I_ADMIN
    ANALYTICS_CTRL --> I_ANALYTICS

    %% Services to Strategies
    I_WORKOUT --> STRATEGY_FAC
    STRATEGY_FAC --> STRAT_STRENGTH & STRAT_CARDIO & STRAT_HIIT & STRAT_CALISTH & STRAT_YOGA
    I_GOAL --> GOAL_EVAL

    %% Services to Repositories
    I_AUTH --> USER_REPO & ACTIVITY_REPO
    I_WORKOUT --> WORKOUT_REPO & USER_REPO & ACTIVITY_REPO
    I_GOAL --> GOAL_REPO & ACTIVITY_REPO
    I_CHALLENGE --> CHALLENGE_REPO & USER_CHALL_REPO & ACTIVITY_REPO
    I_CONTENT --> CONTENT_REPO & ACTIVITY_REPO
    I_ADMIN --> USER_REPO & SETTING_REPO & ACTIVITY_REPO
    I_ANALYTICS --> WORKOUT_REPO & GOAL_REPO & USER_CHALL_REPO

    %% Repositories to Storage
    USER_REPO & WORKOUT_REPO & GOAL_REPO & CHALLENGE_REPO & USER_CHALL_REPO & CONTENT_REPO & ACTIVITY_REPO & SETTING_REPO --> DB
```

---

## 9. Data-Flow Documentation (DFD)

### 9.1 DFD Level 0 (Context Diagram)
The Context Diagram establishes the boundary of the FitPulse platform with external actors:

```mermaid
graph LR
    Athlete((Athlete / User))
    Admin((Administrator))
    System[("FitPulse Enterprise Platform")]
    AnalyticsEngine[("Analytical / Biometric Consumer")]

    Athlete -->|Credentials, Workout Logs, Goals, Challenge Enrolls| System
    System -->|JWT Token, Volume Telemetry, Badges, Milestones, Content| Athlete

    Admin -->|User Moderation, Content Updates, System Flags| System
    System -->|System KPIs, Audit Logs, User Directory, Health Status| Admin

    System -->|Aggregated Biometrics & Activity Streams| AnalyticsEngine
```

---

### 9.2 DFD Level 1 (Subsystem Decomposed Data Flow)
DFD Level 1 decomposes the system into 6 core operational subsystems and persistent data stores:

```mermaid
graph TD
    Athlete((Athlete))
    Admin((Admin))

    subgraph Data_Stores ["Persistent Data Stores"]
        D1[(D1: Users)]
        D2[(D2: Workouts)]
        D3[(D3: Goals)]
        D4[(D4: Challenges & UserChallenges)]
        D5[(D5: Fitness Content)]
        D6[(D6: Activity & Audit Logs)]
        D7[(D7: System Settings)]
    end

    subgraph Processes ["Operational Processes"]
        P1["1.0 Authentication & User Profile Management"]
        P2["2.0 Set-by-Set Workout Logging & Calorie Engine"]
        P3["3.0 Milestone Goal Management & Progress Sync"]
        P4["4.0 Gamified Challenges & Quest Tracking"]
        P5["5.0 Educational Content Moderation"]
        P6["6.0 System Telemetry & Activity Auditing"]
    end

    Athlete -->|Registration / Login| P1
    P1 -->|Read / Write Athlete Credentials| D1
    P1 -->|Log Auth Events| D6

    Athlete -->|Log Workout Sets| P2
    P2 -->|Save Workout Log| D2
    P2 -->|Trigger Goal Progress| P3
    P2 -->|Trigger Challenge Increment| P4
    P2 -->|Log Workout Event| D6

    Athlete -->|Create / Update Goal| P3
    P3 -->|Read / Write Goals| D3
    P3 -->|Log Goal Achievements| D6

    Athlete -->|Enroll & Claim Quest Rewards| P4
    P4 -->|Update Challenge Participation & XP| D4
    P4 -->|Credit User XP| D1
    P4 -->|Log Quest Completion| D6

    Admin -->|Publish Articles & Workout Guides| P5
    P5 -->|Manage Content Records| D5
    P5 -->|Log Content Changes| D6

    Admin -->|View KPIs, User Roles, Settings| P6
    P6 -->|Query Telemetry| D1 & D2 & D6 & D7
    P6 -->|Modify Roles & Flags| D1 & D7
```

---

## 10. Database Entity Relationship Specification (ERD)

```mermaid
erDiagram
    BASE_ENTITY {
        Long id PK
        DateTime created_at
        DateTime updated_at
        Boolean is_deleted
    }

    USERS {
        Long id PK
        String name
        String email UK
        String password_hash
        String role
        String avatar_url
        Boolean is_active
        DateTime created_at
        DateTime updated_at
    }

    WORKOUTS {
        Long id PK
        Long user_id FK
        String workout_type
        Integer duration_minutes
        String intensity
        Integer calories_burned
        Double volume_kg
        DateTime logged_at
        String notes
        DateTime created_at
        DateTime updated_at
    }

    GOALS {
        Long id PK
        Long user_id FK
        String title
        String description
        String goal_type
        Double target_value
        Double current_value
        String status
        DateTime start_date
        DateTime target_date
        DateTime completed_at
        DateTime created_at
        DateTime updated_at
    }

    CHALLENGES {
        Long id PK
        String title
        String description
        String target_metric
        Integer target_value
        Integer duration_days
        Integer reward_xp
        String badge_icon
        String status
        DateTime created_at
        DateTime updated_at
    }

    USER_CHALLENGES {
        Long id PK
        Long user_id FK
        Long challenge_id FK
        Integer progress
        String status
        DateTime enrolled_at
        DateTime completed_at
    }

    FITNESS_CONTENT {
        Long id PK
        String title
        String category
        String description
        String body
        String image_url
        String author
        String status
        Integer read_time_minutes
        Integer views_count
        DateTime created_at
        DateTime updated_at
    }

    ACTIVITY_LOGS {
        Long id PK
        Long user_id
        String user_email
        String activity_type
        String description
        String entity_type
        Long entity_id
        String ip_address
        DateTime timestamp
    }

    SYSTEM_SETTINGS {
        Long id PK
        String setting_key UK
        String setting_value
        String description
        DateTime updated_at
    }

    USERS ||--o{ WORKOUTS : "logs"
    USERS ||--o{ GOALS : "establishes"
    USERS ||--o{ USER_CHALLENGES : "participates"
    CHALLENGES ||--o{ USER_CHALLENGES : "tracks"
    USERS ||--o{ ACTIVITY_LOGS : "triggers"
```

---

## 11. Core Java OOP Architectural Alignment

To satisfy the highest standards of Object-Oriented software engineering in the Java ecosystem, the platform's Java subsystem enforces the following paradigms:

1. **Encapsulation**:
   - All domain entity attributes are strictly `private`.
   - Mutators enforce validation (e.g., negative duration prevention, percentage clamp between 0.0 and 100.0, valid enum state transitions).
   - Defensive copies for mutable timestamps and collections.
2. **Abstraction**:
   - Abstract `BaseEntity` encapsulating primary keys, audit timestamps, and soft deletion flags.
   - Domain interfaces (`Identifiable<ID>`, `Auditable`, `Trackable`, `CalorieCalculable`).
   - Pure service interfaces (`IWorkoutService`, `IGoalService`, `IChallengeService`, `IUserService`, etc.) abstracting business operations from web controllers.
3. **Inheritance**:
   - `BaseEntity` serves as the superclass for `User`, `Workout`, `Goal`, `FitnessChallenge`, `FitnessContent`, `ActivityLog`, and `SystemSetting`.
   - `AbstractCalorieStrategy` provides reusable scientific MET equations inherited by specialized exercise modality strategies.
   - Exception hierarchy rooted at `FitPulseException`, inherited by specific domain exceptions.
4. **Polymorphism**:
   - The **Strategy Pattern** is implemented for Calorie Calculations (`CalorieCalculationStrategy`) dynamically selected at runtime based on `WorkoutType` via `CalorieStrategyFactory`.
   - Dynamic Goal progress evaluation (`GoalProgressStrategy`).
5. **Generics**:
   - Generic response envelopes (`ApiResponse<T>`) and paginated payloads (`PagedResponse<T>`).
   - Generic base repositories (`BaseRepository<T, ID>`) and identifiable contracts (`Identifiable<ID>`).
6. **Collections & Streams**:
   - Idiomatic use of `List<T>`, `Set<T>`, `Map<K, V>`, `Optional<T>`, and `EnumMap`.
   - Java Stream pipelines for aggregation, volume computation, and multi-dimensional grouping (`groupingBy`, `summingInt`).
7. **Rich Domain Enums**:
   - Enums equipped with encapsulated state, constructor arguments, and domain methods (`Role`, `WorkoutType`, `Intensity`, `GoalType`, `GoalStatus`, `ChallengeStatus`, `ActivityType`).
8. **Robust Centralized Exception Handling**:
   - Domain-specific checked/unchecked exception hierarchy mapped cleanly to HTTP status codes via `@RestControllerAdvice`.

---

## 12. JDBC / Database Architecture & ACID Transactions

The FitPulse Java backend incorporates real native JDBC integration alongside Spring Data JPA. This architecture executes direct, high-performance SQL operations with explicit transaction boundary control, zero SQL injection vulnerabilities, and deterministic resource lifecycle management without disturbing or breaking existing database schema tables.

### 12.1 Native JDBC Component Decomposition

| Component | Responsibility | Implementation Details |
| :--- | :--- | :--- |
| `JdbcConnectionManager` | Connection acquisition & transactional template | Wraps Spring `DataSource`, provides direct `java.sql.Connection` instances, and features `<T> executeInTransaction(callback)` executing atomic blocks with automatic commit and rollback. |
| `UserJdbcDao` | Native User entity CRUD | Executes raw SQL via `PreparedStatement` with `Statement.RETURN_GENERATED_KEYS`; maps `ResultSet` to `User` entities; manages XP increments. |
| `WorkoutJdbcDao` | Native Workout CRUD & Multi-Table Transaction | Implements full CRUD; manages atomic multi-table transaction `createWorkoutWithXpTransaction` (inserts workout record + credits user total XP) with explicit `commit()` and `rollback()`. |
| `ChallengeJdbcDao` | Native Challenge CRUD & Atomic Enrollment | Implements full CRUD; executes atomic transaction `enrollUserInChallengeWithTransaction` checking for duplicate enrollment, creating `user_challenges` record, and writing audit entry. |

### 12.2 Universal PreparedStatement Security Guarantee
To guarantee complete immunity against SQL injection vulnerabilities:
- Every query utilizes parameterized statements with `?` placeholders.
- Zero dynamic SQL string concatenation is permitted.
- Strongly typed setters (`setString`, `setLong`, `setInt`, `setTimestamp`, `setBoolean`) bind all inputs safely.

### 12.3 Explicit ACID Transaction Management

FitPulse implements native transaction management adhering to strict ACID guarantees:

```mermaid
sequenceDiagram
    autonumber
    participant Svc as WorkoutJdbcService
    participant Dao as WorkoutJdbcDao
    participant Conn as java.sql.Connection
    participant DB as Relational Database

    Svc->>Dao: createWorkoutWithXpTransaction(workout, xpAward)
    Dao->>Conn: setAutoCommit(false) [Begin ACID Transaction]
    Dao->>DB: PreparedStatement 1: INSERT INTO workout_logs (...)
    alt Statement 1 Succeeded
        Dao->>DB: PreparedStatement 2: UPDATE users SET total_xp = total_xp + ? (...)
        alt Statement 2 Succeeded
            Dao->>Conn: commit() [Persist Atomically]
            Dao->>Svc: Return saved WorkoutLog
        else Statement 2 Failed (SQLException)
            Dao->>Conn: rollback() [Revert All Changes]
            Dao->>Svc: Propagate SQLException
        end
    else Statement 1 Failed (SQLException)
        Dao->>Conn: rollback() [Revert All Changes]
        Dao->>Svc: Propagate SQLException
    end
    Dao->>Conn: close() [Release to Pool]
```

---

## 13. Java Servlets & Web Integration

FitPulse provides native Java `HttpServlet` integration alongside the Spring MVC REST controllers. The Servlets are registered in the embedded Tomcat container using Spring Boot's `ServletRegistrationBean`, providing high-throughput endpoints that talk directly to the JDBC service layer.

### 13.1 End-to-End Architectural Flow
The complete request-response flow strictly maintains:
$$\text{HTTP Request} \longrightarrow \text{HttpServlet} \longrightarrow \text{JDBC Service} \longrightarrow \text{JDBC DAO / Repository} \longrightarrow \text{Database} \longrightarrow \text{HTTP Response}$$

```mermaid
sequenceDiagram
    autonumber
    participant Client as HTTP Client (Postman / Browser)
    participant Servlet as UserServlet / WorkoutServlet / ChallengeServlet
    participant Svc as IUserJdbcService / IWorkoutJdbcService
    participant Dao as UserJdbcDao / WorkoutJdbcDao
    participant DB as Relational Database (H2 / PostgreSQL)

    Client->>Servlet: HTTP Request (GET / POST / PUT / DELETE)
    Servlet->>Servlet: Parse path parameters, query params, or JSON body
    Servlet->>Svc: Invoke Service Method (e.g. logWorkoutSession)
    Svc->>Svc: Execute business validation & MET calorie estimation
    Svc->>Dao: Call DAO Method (e.g. createWorkoutWithXpTransaction)
    Dao->>DB: PreparedStatement executeQuery() / executeUpdate()
    DB-->>Dao: ResultSet / affectedRows
    Dao-->>Svc: Domain Entity Model (User / WorkoutLog / Challenge)
    Svc-->>Servlet: Return entity / DTO
    Servlet->>Servlet: Serialize via Jackson ObjectMapper & set HTTP Status Code
    Servlet-->>Client: HTTP JSON Response (200 OK / 201 Created / 400 Bad Request)
```

### 13.2 Servlet Endpoint Specification

| Servlet Class | Method | URL Pattern | Responsibility | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `UserServlet` | `GET` | `/servlet/users` | List paginated users | `200 OK`, `500 Server Error` |
| `UserServlet` | `GET` | `/servlet/users/{id}` | Retrieve athlete profile by ID | `200 OK`, `404 Not Found` |
| `UserServlet` | `POST` | `/servlet/users` | Register athlete via JDBC | `201 Created`, `400 Bad Request` |
| `UserServlet` | `PUT` | `/servlet/users/{id}` | Update athlete details | `200 OK`, `404 Not Found` |
| `UserServlet` | `DELETE`| `/servlet/users/{id}` | Soft delete athlete account | `200 OK`, `404 Not Found` |
| `WorkoutServlet` | `GET` | `/servlet/workouts` | List paginated workout logs | `200 OK`, `500 Server Error` |
| `WorkoutServlet` | `GET` | `/servlet/workouts/{id}` | Get workout session by ID | `200 OK`, `404 Not Found` |
| `WorkoutServlet` | `GET` | `/servlet/workouts?userId={id}`| Filter workouts by athlete | `200 OK`, `500 Server Error` |
| `WorkoutServlet` | `POST` | `/servlet/workouts` | Log workout + credit XP (ACID Tx) | `201 Created`, `400 Bad Request` |
| `WorkoutServlet` | `PUT` | `/servlet/workouts/{id}` | Update workout telemetry | `200 OK`, `404 Not Found` |
| `WorkoutServlet` | `DELETE`| `/servlet/workouts/{id}` | Delete workout record | `200 OK`, `404 Not Found` |
| `ChallengeServlet`| `GET` | `/servlet/challenges` | List all community challenges | `200 OK`, `500 Server Error` |
| `ChallengeServlet`| `GET` | `/servlet/challenges/active` | List open active challenges | `200 OK`, `500 Server Error` |
| `ChallengeServlet`| `GET` | `/servlet/challenges/{id}` | Get challenge by ID | `200 OK`, `404 Not Found` |
| `ChallengeServlet`| `POST` | `/servlet/challenges` | Create new challenge | `201 Created`, `400 Bad Request` |
| `ChallengeServlet`| `POST` | `/servlet/challenges/{id}/enroll`| Enroll athlete in challenge (ACID Tx)| `201 Created`, `400 Bad Request` |
| `ChallengeServlet`| `PUT` | `/servlet/challenges/{id}` | Update challenge criteria | `200 OK`, `404 Not Found` |
| `ChallengeServlet`| `DELETE`| `/servlet/challenges/{id}` | Soft delete challenge | `200 OK`, `404 Not Found` |

---

## 14. Progress Tracking & Database Analytics Engine

To eliminate deceptive hardcoded mock values, FitPulse implements a pure database aggregation analytics engine across both Java Spring Boot and Node.js/Express backends.

### 14.1 Metrics & Mathematical Formulas
Every metric displayed on the Athlete Biomechanics Dashboard and the Analytics Page is calculated dynamically from persisted records:

1. **Weekly Activity (Rolling 7 Days)**:
   $$\text{Weekly Duration (hours)} = \frac{1}{60} \sum_{i \in \text{Workouts}_{t \ge \text{now} - 7d}} \text{duration\_minutes}_i$$
   $$\text{Weekly Caloric Output (kcal)} = \sum_{i \in \text{Workouts}_{t \ge \text{now} - 7d}} \text{calories\_burned}_i$$
   $$\text{Weekly Session Count} = |\text{Workouts}_{t \ge \text{now} - 7d}|$$

2. **Monthly Activity (Rolling 30 Days)**:
   $$\text{Monthly Duration (hours)} = \frac{1}{60} \sum_{i \in \text{Workouts}_{t \ge \text{now} - 30d}} \text{duration\_minutes}_i$$
   $$\text{Monthly Caloric Output (kcal)} = \sum_{i \in \text{Workouts}_{t \ge \text{now} - 30d}} \text{calories\_burned}_i$$
   $$\text{Monthly Session Count} = |\text{Workouts}_{t \ge \text{now} - 30d}|$$

3. **Goal Progress Aggregation**:
   $$\text{Average Completion \%} = \frac{1}{N_{\text{goals}}} \sum_{g=1}^{N_{\text{goals}}} \min\left(100, \left\lfloor \frac{\text{current\_value}_g}{\text{target\_value}_g} \times 100 \right\rfloor\right)$$

4. **Challenge Progress Aggregation**:
   $$\text{Challenge Completion Rate \%} = \frac{|\text{UserChallenges}_{\text{COMPLETED}}|}{|\text{UserChallenges}_{\text{TOTAL}}|} \times 100$$

5. **Rolling 7-Day Baseline Distribution**:
   - For every day in the last 7 calendar days $[d-6, \dots, d-0]$, the system seeds a zero baseline and aggregates logged duration and caloric output. Days without recorded sessions render an honest 0 kcal baseline, eliminating misleading static defaults.

---

## 15. Fitness Goals Architecture & Lifecycle

Personal fitness goals empower athletes to define verifiable milestones across Caloric Burn (`CALORIE_BURN`), Training Duration (`DURATION_MINUTES`), Session Frequency (`WORKOUT_COUNT`), or Distance (`DISTANCE`).

```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS: POST /api/goals
    IN_PROGRESS --> IN_PROGRESS: PUT /api/goals/:id (Target or value change)
    IN_PROGRESS --> IN_PROGRESS: POST /api/goals/:id/increment (currentValue < targetValue)
    IN_PROGRESS --> COMPLETED: currentValue >= targetValue (Auto-completion triggered)
    IN_PROGRESS --> ABANDONED: POST /api/goals/:id/abandon
    COMPLETED --> [*]
    ABANDONED --> [*]
    IN_PROGRESS --> [*]: DELETE /api/goals/:id (Permanent Purge)
```

### 15.1 Goals CRUD API Contract
| Operation | Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/goals` | Creates a milestone with title, description, target value, initial value, deadline (`targetDate`), and calculated percentage. |
| **Read** | `GET` | `/api/goals` | Lists all personal goals for the authenticated athlete with status filtering (`?status=IN_PROGRESS`). |
| **Read Single** | `GET` | `/api/goals/:id` | Returns specific goal details; strictly validates athlete ownership. |
| **Update** | `PUT` | `/api/goals/:id` | Modifies target, current progress, deadline, or status; auto-transitions to `COMPLETED` when target met. |
| **Increment** | `POST` | `/api/goals/:id/increment`| Quick-increment endpoint allowing atomic addition to `current_value`. |
| **Abandon** | `POST` | `/api/goals/:id/abandon` | Transitions an active goal to `ABANDONED` without deletion. |
| **Delete** | `DELETE`| `/api/goals/:id` | Permanently deletes goal record from database with ownership enforcement. |

---

## 16. Fitness Challenges Governance & Gamification

The FitPulse Challenge Arena delivers collaborative gamification with administrative oversight, strict duplicate prevention, and persistent historical tracking.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as FitPulse Admin
    actor User as Athlete
    participant API as Challenge Controller
    participant DB as Relational Database

    Note over Admin, DB: Administrative Challenge Lifecycle
    Admin->>API: POST /api/challenges/admin/create (Title, target, dates, badge)
    API->>DB: INSERT INTO challenges (...)
    DB-->>API: Challenge created
    API-->>Admin: 201 Created (Challenge published)

    Note over User, DB: Athlete Participation & Duplicate Prevention
    User->>API: GET /api/challenges
    API-->>User: 200 OK (List of challenges with user_status)
    User->>API: POST /api/challenges/:id/join
    API->>DB: Check existing enrollment (user_id, challenge_id)
    alt Already Enrolled
        API-->>User: 400 Bad Request ("You have already joined this challenge.")
    else First Enrollment
        API->>DB: INSERT INTO user_challenges (user_id, challenge_id, status='IN_PROGRESS', progress=0)
        API-->>User: 201 Created ("Successfully joined challenge!")
    end

    Note over User, DB: Progress Logging & History
    User->>API: POST /api/challenges/:id/progress { current_progress: 300 }
    API->>DB: UPDATE user_challenges SET current_progress = 300
    API-->>User: 200 OK (Progress updated)
    User->>API: GET /api/challenges/my/history
    API->>DB: SELECT * FROM user_challenges WHERE user_id = :userId ORDER BY joined_at DESC
    API-->>User: 200 OK (Complete chronological participation record)

    Note over Admin, DB: Live Roster Monitoring & Governance
    Admin->>API: GET /api/challenges/admin/:id/monitor
    API->>DB: Aggregate totalParticipants, completedCount, inProgressCount, roster details
    API-->>Admin: 200 OK (Live monitor telemetry & participant table)
    Admin->>API: PUT /api/challenges/admin/:id (Adjust target/badge)
    Admin->>API: DELETE /api/challenges/admin/:id (Purge challenge & enrollments)
```

---

## 17. Admin User Management Architecture (Requirement 10)

FitPulse implements administrative control over user accounts, incorporating role-based privilege management, live search filtering, account deactivation/suspension, and self-protection constraints.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as FitPulse Admin
    actor User as Regular Athlete
    participant API as Admin Controller & Auth Guards
    participant DB as Relational Database / Prisma

    Note over User, API: Unauthorized Access Attempt
    User->>API: GET /api/admin/users
    API->>API: requireRole('ADMIN') check
    API-->>User: 403 Forbidden (Access Denied)

    Note over Admin, DB: User Listing, Search & Filtering
    Admin->>API: GET /api/admin/users?search=sarah&role=USER&status=ACTIVE
    API->>DB: SELECT u.*, COUNT(w.id) as workoutsCount FROM users u LEFT JOIN workouts w ...
    DB-->>API: Filtered records + pagination metadata
    API-->>Admin: 200 OK ({ users: [...], total, page, limit, totalPages })

    Note over Admin, DB: Role & Status Updates with Self-Protection
    Admin->>API: PATCH /api/admin/users/:id/role { role: "ADMIN" }
    alt Admin edits own account
        API-->>Admin: 400 Bad Request ("Cannot demote or deactivate your own account.")
    else Managed User Target
        API->>DB: UPDATE users SET role = 'ADMIN' WHERE id = :id
        API->>DB: INSERT INTO audit_logs (action='ROLE_UPDATED', target_id=:id, ...)
        API-->>Admin: 200 OK (User promoted to ADMIN)
    end

    Admin->>API: PATCH /api/admin/users/:id/status { is_active: false }
    API->>DB: UPDATE users SET is_active = false WHERE id = :id
    API->>DB: INSERT INTO audit_logs (action='USER_SUSPENDED', target_id=:id, ...)
    API-->>Admin: 200 OK (User status set to Suspended)
```

### 17.1 Admin User Management API Contract
| Method | Route | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List users with query search (`name`, `email`), `role` (`ALL`, `USER`, `ADMIN`), and `status` (`ACTIVE`, `SUSPENDED`). | `ADMIN` only (403 for `USER`) |
| `POST` | `/api/admin/users` | Admin provisions an athlete or staff account directly. | `ADMIN` only |
| `PATCH` | `/api/admin/users/:id` | Edit user name, email, role, or active status. Prevents self-demotion. | `ADMIN` only |
| `PATCH` | `/api/admin/users/:id/role` | Promote/demote user permissions (`USER` ↔ `ADMIN`). | `ADMIN` only |
| `PATCH` | `/api/admin/users/:id/status`| Deactivate or reactivate athlete account (`is_active: boolean`). | `ADMIN` only |
| `DELETE`| `/api/admin/users/:id` | Soft-deactivates or purges user account with audit logging. Self-deletion blocked. | `ADMIN` only |

---

## 18. Fitness Content Moderation Pipeline (Requirement 11)

FitPulse delivers a content curation and publishing workflow that ensures community nutrition guides, training protocols, and workout routines meet safety and scientific quality standards.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Athlete submits guide (POST /api/content)
    [*] --> APPROVED: Admin publishes directly (POST /api/content)
    
    PENDING --> APPROVED: Admin approves (PATCH /api/content/admin/:id/moderate)
    PENDING --> REJECTED: Admin rejects with feedback notes
    REJECTED --> PENDING: Athlete revises and resubmits
    
    APPROVED --> [*]: Visible to all athletes (GET /api/content)
    REJECTED --> [*]: Visible only to author with notes (GET /api/content/my)
    PENDING --> [*]: Visible only to author & admin workbench
    APPROVED --> [*]: Purged by Admin (DELETE /api/content/admin/:id)
```

### 18.1 Content Access & Isolation Matrix
- **Public Feed (`GET /api/content`)**: Strictly filtered by `WHERE status = 'APPROVED'`. Regular users and public athletes can never access unreviewed drafts or rejected material.
- **Athlete Submissions (`GET /api/content/my`)**: Authenticated athletes can view their entire submission history (`PENDING`, `APPROVED`, `REJECTED`) along with any reviewer feedback provided by staff.
- **Admin Moderation Workbench (`GET /api/content/admin/all`)**: Administrators view all submissions across any status, filter by status tab (`ALL`, `PENDING`, `APPROVED`, `REJECTED`), approve with 1 click, or reject with a feedback dialog.

---

## 19. System Settings Database Engine (Requirement 12)

FitPulse eliminates hardcoded configuration flags by persisting all platform operational toggles into the relational database (`SystemSetting` entity), allowing live runtime adjustments without system restarts.

```mermaid
graph TD
    A[Platform Boot / API Call] --> B{Settings Table Empty?}
    B -- Yes --> C[Auto-Seed Default Configuration Parameters]
    B -- No --> D[Fetch Current Database Settings]
    C --> D
    
    D --> E[GET /api/admin/settings]
    E --> F[Admin Settings Dashboard UI]
    
    F -->|Toggle Boolean / Edit Value| G[PUT /api/admin/settings/:key]
    G --> H[Update SystemSetting in Database]
    H --> I[Append Security Audit Log Record]
    I --> J[Immediate Platform-Wide Effect]
```

### 19.1 Persisted System Settings Schema & Default Keys
| Configuration Key | Default Value | Type | Functional Impact |
| :--- | :--- | :--- | :--- |
| `maintenance_mode` | `false` | `boolean` | When true, restricts athlete write access for scheduled infrastructure upgrades. |
| `user_registration_enabled`| `true` | `boolean` | Controls public signups; toggling off creates an invitation-only state. |
| `require_email_verify` | `false` | `boolean` | Enforces verification step prior to granting full workout logging access. |
| `dynamic_met_scaling` | `true` | `boolean` | Enables real-time MET calorie burn calculations based on bodyweight and intensity. |
| `max_workout_duration_minutes` | `360` | `number` | Enforces sanitization boundary on excessive workout durations (6-hour safety cap). |

All updates to system parameters are captured in `audit_logs` with the performing Administrator's ID, timestamp, and previous state.

---

## 20. Activity Monitoring & Security Audit Trail (Requirement 13)

FitPulse implements an immutable activity logging pipeline that records all critical user, workout, challenge, and administrative operations.

```mermaid
sequenceDiagram
    autonumber
    actor Actor as Athlete / Admin
    participant Controller as Domain Controller
    participant Service as Domain Service
    participant ActivityService as Activity Service
    participant DB as Audit Logs Table

    Actor->>Controller: HTTP Request (e.g., Log Workout, Join Challenge, Moderate Content)
    Controller->>Service: Execute Domain Business Logic
    Service->>DB: Perform Relational State Mutation
    Service->>ActivityService: ActivityService.log(actorId, actionType, detailsPayload)
    ActivityService->>DB: INSERT INTO audit_logs (user_id, action, details, timestamp)
    Service-->>Controller: Domain Response
    Controller-->>Actor: 200/201 Success Response
```

### 20.1 Core Event Domain Taxonomy
| Domain | Action Name | Context Payload Attributes |
| :--- | :--- | :--- |
| **Authentication** | `USER_LOGIN` | IP address, timestamp, client user agent |
| **Account** | `USER_REGISTER` | Email address, role assigned |
| **Workout** | `LOG_WORKOUT` | Workout ID, type, duration (minutes), calories burned |
| **Workout** | `UPDATE_WORKOUT` | Workout ID, modified parameters |
| **Workout** | `DELETE_WORKOUT` | Workout ID, discipline type |
| **Challenge** | `JOIN_CHALLENGE` | Challenge ID, quest title |
| **Challenge** | `UPDATE_CHALLENGE_PROGRESS` | Challenge ID, new progress value, milestone status |
| **Challenge** | `CHALLENGE_COMPLETED` | Challenge ID, quest title, final score |
| **User Admin** | `ADMIN_CREATE_USER` | Target user ID, email address, role |
| **User Admin** | `ADMIN_UPDATE_USER` | Target user ID, updated field parameters |
| **User Admin** | `ADMIN_UPDATE_ROLE` | Target user ID, previous role, elevated role |
| **User Admin** | `ADMIN_TOGGLE_USER_STATUS` | Target user ID, boolean active state |
| **User Admin** | `ADMIN_DELETE_USER` | Target user ID, email address |
| **Content** | `CREATE_FITNESS_CONTENT` | Content ID, title, initial state (`PENDING` or `APPROVED`) |
| **Content** | `MODERATE_CONTENT` | Content ID, status (`APPROVED`/`REJECTED`), reviewer feedback |
| **Content** | `DELETE_FITNESS_CONTENT` | Content ID, guide title |
| **Settings** | `UPDATE_SYSTEM_SETTING` | Configuration key, updated value |

---

## 21. Real Database-Driven Admin Statistics Engine (Requirement 14)

FitPulse replaces mock statistics with live database queries across all domain entities:

```mermaid
graph TD
    A[Admin Dashboard Request: GET /api/admin/statistics] --> B[AdminService.getPlatformStatistics]
    
    B --> C[User Demographics: Count, Active/Suspended Split, Role Distribution, 30d Growth]
    B --> D[Workout Telemetry: Total Count, Sum/Avg Calories, Duration Hours, Discipline Grouping]
    B --> E[Challenge Funnel: Total Quests, Enrollments, Completed Count, Completion Rate %]
    B --> F[Content Moderation: 3-State Queue Counts & Category Distribution]
    B --> G[Rolling 7-Day Velocity: Day-by-Day Session Count, Calories Burned, Active Athletes]
    
    C & D & E & F & G --> H[Structured JSON Payload]
    H --> I[Admin Dashboard Reactive UI Visualizations & Charts]
```

---

## 22. Code Quality, Clean Architecture & Security Standards (Requirement 15)

FitPulse enforces industry-standard software engineering practices across both the Node.js/Express and Java Spring Boot implementations:

### 22.1 Layered Architectural Separation
```
Client (React / Vite)
       │
       ▼
Controllers (HTTP Parsing, Validation & Status Codes)
       │
       ▼
Services (Business Logic, Calorie Calculations, Propagation, Audit Logging)
       │
       ▼
Repositories & Models (Prisma ORM / Spring Data JPA & JDBC)
       │
       ▼
Database (SQLite / PostgreSQL)
```

1. **Controller → Service → Repository Separation**:
   - Controllers handle HTTP request validation and JSON responses.
   - Business logic is isolated in dedicated service classes (`AdminService`, `WorkoutService`, `AuthService`, `ActivityService`).
2. **Proper Naming Conventions**:
   - PascalCase for classes and interfaces (`AdminService`, `PlatformStatistics`).
   - camelCase for methods, variables, and properties (`getPlatformStatistics`, `activeWorkoutsToday`).
   - UPPER_SNAKE_CASE for constants and enum types (`USER_LOGIN`, `CALORIES`, `HIGH`).
3. **Dead Code & Log Elimination**:
   - No dead or unreferenced code.
   - Unnecessary debug `console.log` statements removed in favor of structured audit logs and server request logging.
4. **Environment Secret Decoupling**:
   - Zero hardcoded credentials or private keys in source code.
   - Standardized `backend/.env.example` template provided with configuration instructions.

---

## 23. Team Responsibilities & Contributions (Requirement 17)

For full architectural ownership mapping and detailed engineering handoffs, refer to the dedicated specification:
👉 **[Team Responsibilities & Engineering Contributions Documentation](file:///c:/Users/user/Downloads/GUVI_Java_Project-main/GUVI_Java_Project-main/docs/TEAM_RESPONSIBILITIES_AND_CONTRIBUTIONS.md)**

### Authentic Modular Division of Engineering Domains:
* **Module 1: Core Java, JDBC & Servlet Engineering Subsystem**: Complete OOP hierarchy (`BaseEntity`, `Workout`, `Goal`, `Challenge`), strategy pattern for metabolic calculations, raw JDBC services with transactional rollback, and Jakarta Servlet endpoints.
* **Module 2: REST API & Relational Database Architecture**: High-performance Express REST API, Prisma schema modeling, and decoupled domain services (`AdminService`, `ActivityService`, `WorkoutService`).
* **Module 3: Frontend Engineering & WebGL 3D Visualization**: Reactive SPA in React 19, interactive workout logging console, and hardware-accelerated WebGL visualizations (`AdminGlobe3D`, `MuscleAnatomy3D`, `HolographicBadge3D`, `ActivityOrb`).
* **Module 4: Security, RBAC & Audit Telemetry**: Dual-role authorization (`USER` vs `ADMIN`), defensive self-protection guards, and tamper-resistant audit logging (`ActivityLog`).
* **Module 5: Automated Testing & Quality Assurance**: Comprehensive automated test harness (`test-e2e.ts`) verifying 72+ positive and negative assertions with 0 failures, plus JUnit 5 Mockito Java service suites.
* **Module 6: System Architecture & Technical Specifications**: End-to-end design documentation, ER diagrams, DFD Level 0/1 diagrams, and API manuals.
