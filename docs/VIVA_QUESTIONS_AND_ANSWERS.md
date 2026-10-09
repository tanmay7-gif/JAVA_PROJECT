# FitPulse — Technical Viva Voce Questions & Answers Manual

## 🎓 Overview

This comprehensive examination manual prepares engineers, architects, and evaluators for technical defense of the **FitPulse Athletic & Clinical Fitness Platform**. It covers Core Java, JDBC, Jakarta Servlets, REST microservices, Relational Databases, RBAC Security, Full-Stack React with 3D WebGL, and Automated Verification.

---

## ☕ Category 1: Core Java & Object-Oriented Programming (OOP)

### Q1: How does FitPulse implement the four pillars of OOP?
**Answer:**
1. **Encapsulation**: All domain entities (`User`, `Workout`, `Goal`, `Challenge`) maintain private attributes with validated getters and mutators, defensive copying on dates/collections, and domain transition methods (e.g., `promoteToAdmin()`, `incrementProgress()`).
2. **Abstraction**: Provided by abstract superclasses (`BaseEntity`) and domain contracts (`Identifiable<ID>`, `Auditable`, `Trackable`, `CalorieCalculable`), separating contract from implementation.
3. **Inheritance**: `BaseEntity` serves as the mapped superclass for all entities, propagating primary key identity, audit timestamps (`createdAt`, `updatedAt`), and soft-delete states.
4. **Polymorphism**: The metabolic engine implements the **Strategy Pattern** via `CalorieCalculationStrategy` with specialized algorithms for `Cardio`, `Strength`, `HIIT`, and `Yoga`, dynamically selected by `CalorieStrategyFactory`.

### Q2: Why did you use the Strategy Pattern for Calorie Calculation instead of a switch-case statement?
**Answer:**
A switch-case statement violates the **Open-Closed Principle (OCP)** from SOLID. Adding a new workout type (e.g., Pilates or Swimming) would require modifying existing core methods, risking regression bugs. With the Strategy Pattern, each calculation algorithm is encapsulated in its own class implementing `CalorieCalculationStrategy`. New sports can be introduced by creating a new strategy class without modifying existing calculation logic.

### Q3: How are Java Collections and Streams utilized in the system?
**Answer:**
- **`List<T>` and `Set<T>`**: Used to manage participant rosters, completed challenge badges, and workout logs without duplicate entries.
- **`EnumMap<WorkoutType, Double>`**: Used inside the metabolic strategy factory for high-performance memory-contiguous map lookups.
- **Java Streams API**: Utilized extensively in analytics pipelines for filtering (`.filter()`), sorting by date (`.sorted()`), mapping DTOs (`.map()`), and aggregate calculations (`Collectors.groupingBy()`, `Collectors.summingInt()`).

### Q4: Explain the custom Exception Hierarchy in the Java backend.
**Answer:**
FitPulse defines a root runtime exception `FitPulseException` extended by specialized domain exceptions:
- `ResourceNotFoundException` (mapped to HTTP 404)
- `BadRequestException` (mapped to HTTP 400)
- `UnauthorizedException` (mapped to HTTP 401)
- `ForbiddenException` (mapped to HTTP 403)
- `DuplicateResourceException` (mapped to HTTP 409)

These are captured centrally by `@RestControllerAdvice` (`GlobalExceptionHandler`), returning standardized `ApiResponse<T>` JSON envelopes and preventing raw stack trace exposure.

---

## 🗄️ Category 2: JDBC & Database Transactions

### Q5: What is the difference between `Statement` and `PreparedStatement`? Which did you use and why?
**Answer:**
- **`Statement`**: Compiles the SQL query every time it executes and concatenates raw input strings, creating severe vulnerability to SQL Injection attacks.
- **`PreparedStatement`**: Pre-compiles the query template with `?` positional parameters. The database driver treats parameter inputs strictly as literal values rather than executable code, guaranteeing **complete immunity to SQL Injection**.
- FitPulse strictly uses `PreparedStatement` across all native JDBC DAO classes (`UserJdbcDao`, `WorkoutJdbcDao`, `ChallengeJdbcDao`).

### Q6: How does FitPulse handle ACID transactions in raw JDBC?
**Answer:**
Through `JdbcConnectionManager.executeInTransaction()`:
1. `conn.setAutoCommit(false)` disables automatic committing of individual SQL statements.
2. The transactional operations (e.g., logging a workout and updating challenge progress) execute sequentially on the same active `Connection`.
3. If all statements succeed, `conn.commit()` commits the changes atomically.
4. If any `SQLException` or `RuntimeException` occurs, the `catch` block invokes `conn.rollback()`, ensuring the database state remains consistent.
5. In a `finally` block or via try-with-resources, `conn.setAutoCommit(true)` is restored and the connection is safely released.

### Q7: How are generated primary keys retrieved after an INSERT operation in JDBC?
**Answer:**
When creating the `PreparedStatement`, we supply the flag `Statement.RETURN_GENERATED_KEYS`:
```java
PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
stmt.executeUpdate();
try (ResultSet rs = stmt.getGeneratedKeys()) {
    if (rs.next()) {
        user.setId(rs.getLong(1));
    }
}
```

---

## 🌐 Category 3: Java Servlets & Web Integration

### Q8: Explain the lifecycle and execution pipeline of a Java Servlet in FitPulse.
**Answer:**
Native servlets extend `HttpServlet` and are registered in Spring Boot via `ServletRegistrationBean`:
1. **Request Reception**: An incoming HTTP request (e.g., `POST /api/v1/servlets/workouts`) is routed by the servlet container to `WorkoutServlet`.
2. **Method Dispatch**: `HttpServlet.service()` dispatches to `doGet()`, `doPost()`, `doPut()`, or `doDelete()`.
3. **Data Parsing**: The servlet reads the request body via `request.getReader()`, parsing JSON into domain models using Jackson's `ObjectMapper`.
4. **Service Delegation**: The servlet invokes the corresponding service interface (`IWorkoutJdbcService`).
5. **DAO Execution**: The service delegates to `WorkoutJdbcDao`, executing parameterized SQL via `PreparedStatement`.
6. **Response Generation**: The servlet sets the status (`200`, `201`, `400`, `404`), sets `response.setContentType("application/json")`, and writes the serialized JSON response.

### Q9: What pipeline connects Servlets to the Database?
**Answer:**
The flow follows a strict 4-tier pipeline:
$$\text{HTTP Request} \longrightarrow \text{Servlet} \longrightarrow \text{Service Layer} \longrightarrow \text{JDBC DAO Layer} \longrightarrow \text{Database} \longrightarrow \text{HTTP Response}$$

---

## 🛡️ Category 4: Security, Authentication & RBAC

### Q10: How does FitPulse handle password storage and authentication?
**Answer:**
FitPulse never stores plaintext passwords. Passwords are encrypted using **BCrypt** with 10 salt rounds. During login, `bcrypt.compare()` performs a constant-time cryptographic hash comparison, preventing timing attacks. When returning user data from any endpoint, `password_hash` is explicitly excluded from the projection.

### Q11: Explain how Role-Based Access Control (RBAC) is enforced.
**Answer:**
The system defines two roles: `USER` (Athletes) and `ADMIN` (Staff/Administrators).
- All requests pass through `authenticateToken` middleware, decoding the JWT and populating `req.user`.
- Administrative endpoints (e.g., `/api/admin/*`, `/api/challenges/admin/*`) apply `requireRole('ADMIN')`.
- If an athlete attempts to call an admin API, the server terminates the request immediately with a `403 Forbidden` response.
- Unauthenticated requests return `401 Unauthorized`.

### Q12: What are Administrative Self-Protection Guards?
**Answer:**
Service-level validation rules preventing administrative lockouts:
1. **Self-Deletion Guard**: Prevents an administrator from deleting their own user account (`400 Bad Request`).
2. **Self-Demotion Guard**: Prevents an administrator from revoking their own administrator privileges.
3. **Self-Deactivation Guard**: Prevents an administrator from suspending their own active status.

---

## ⚡ Category 5: REST API & System Architecture

### Q13: What is the Controller-Service-Repository separation, and why is it essential?
**Answer:**
- **Controller Layer**: Handles HTTP concerns (routing, status codes, query/param parsing, request validation). Contains no business logic.
- **Service Layer**: Implements domain business logic, polymorphic computations, transaction boundaries, and audit logging.
- **Repository / DAO Layer**: Interfaces with the database via Prisma ORM or JDBC `PreparedStatement`.
- **Benefits**: High testability, decoupled dependencies, modular maintenance, and adherence to the Single Responsibility Principle (SRP).

### Q14: How does FitPulse estimate calories scientifically?
**Answer:**
Using the **Metabolic Equivalent of Task (MET)** formula:
$$\text{Calories Burned} = \text{MET} \times \text{Body Weight (kg)} \times \left(\frac{\text{Duration (minutes)}}{60}\right)$$
The system stores MET reference tables categorized by modality (Running, Cycling, HIIT, Strength, Yoga) and intensity level (LOW, MEDIUM, HIGH).

---

## 🎨 Category 6: Frontend & 3D WebGL Engineering

### Q15: How does FitPulse integrate 3D hardware-accelerated graphics in React?
**Answer:**
FitPulse uses **Three.js** with **`@react-three/fiber`** and **`@react-three/drei`**:
1. **`ActivityOrb`**: Renders a dynamic particle sphere that oscillates its rotation speed and glow shader intensity in response to the user's weekly training volume load.
2. **`HolographicBadge3D`**: Renders 3D enamel achievement medals with dynamic specular lighting and interactive pointer rotation.
3. **`AdminGlobe3D`**: Renders an interactive 3D globe showing global athlete activity telemetry on the Admin Dashboard.
4. **`MuscleAnatomy3D`**: Highlights anatomical muscle groups based on the selected workout modality.

### Q16: How does the Adaptive Recovery Recommendation Engine work?
**Answer:**
The engine analyzes the user's recent workout modality and intensity mix:
- If recent workouts were high-intensity (HIIT or heavy resistance), it recommends **Zone-2 Aerobic Flush & Fascial Mobility** (active recovery) to accelerate metabolic lactate clearance.
- If recent volume was cardio-heavy, it recommends **Posterior Chain & Core Stabilization** to counterbalance repetitive strain.
- Each recommendation provides estimated burn, target duration, and a biomechanical form cue with a one-click quick log trigger.

---

## 🧪 Category 7: Testing & Quality Assurance

### Q17: Describe your automated testing strategy.
**Answer:**
We implement a dual-layer testing pyramid:
1. **End-to-End Automated Integration Suite (`test-e2e.ts`)**: Runs 72+ tests against the live API covering positive workflows and negative edge cases (bad passwords, ghost users, duplicate signups, athlete privilege escalation, non-existent entity updates/deletes, invalid payload boundaries). All 72 tests pass with 0 failures.
2. **JUnit 5 & Mockito Java Service Tests**: Unit test suites (`AuthServiceTest`, `WorkoutServiceTest`, `GoalServiceTest`, `ChallengeServiceTest`, `AdminServiceTest`, `ContentServiceTest`) testing business logic isolation, mock repository behaviors, and exception handling.

### Q18: Why is testing negative/failure paths just as important as testing happy paths?
**Answer:**
Testing failure cases guarantees system resilience, prevents data corruption, and validates security defenses. For example, testing that duplicate challenge enrollments return `400`, unauthenticated requests return `401`, athlete admin calls return `403`, and non-existent IDs return `404` proves that boundary validation and RBAC cannot be bypassed.
