package com.fitpulse.jdbc;

import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Native JDBC Data Access Object for Workout entities.
 * Demonstrates:
 * - Real JDBC Integration using java.sql.Connection, PreparedStatement, and ResultSet.
 * - Comprehensive CRUD operations (Create, Read, Update, Delete).
 * - Safe parameterized PreparedStatement queries.
 * - Explicit ACID Transaction Handling (Connection setAutoCommit(false), commit(), rollback()).
 */
@Repository
public class WorkoutJdbcDao {

    private final JdbcConnectionManager connectionManager;
    private final UserJdbcDao userJdbcDao;

    public WorkoutJdbcDao(JdbcConnectionManager connectionManager, UserJdbcDao userJdbcDao) {
        this.connectionManager = connectionManager;
        this.userJdbcDao = userJdbcDao;
    }

    /**
     * Inserts a new workout session record using PreparedStatement with generated keys.
     */
    public WorkoutLog create(WorkoutLog workout) throws SQLException {
        String sql = "INSERT INTO workout_logs (user_id, workout_type, duration_minutes, intensity, " +
                     "calories_burned, volume_kg, logged_at, notes, record_type, created_at, updated_at, is_deleted) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime loggedTime = workout.getLoggedAt() != null ? workout.getLoggedAt() : now;

            stmt.setLong(1, workout.getUser().getId());
            stmt.setString(2, workout.getWorkoutType().name());
            stmt.setInt(3, workout.getDurationMinutes());
            stmt.setString(4, workout.getIntensity().name());
            stmt.setInt(5, workout.getCaloriesBurned());
            stmt.setDouble(6, workout.getVolumeKg() != null ? workout.getVolumeKg() : 0.0);
            stmt.setTimestamp(7, Timestamp.valueOf(loggedTime));
            stmt.setString(8, workout.getNotes());
            stmt.setString(9, "LOG");
            stmt.setTimestamp(10, Timestamp.valueOf(now));
            stmt.setTimestamp(11, Timestamp.valueOf(now));
            stmt.setBoolean(12, false);

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating workout failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    workout.setId(generatedKeys.getLong(1));
                }
            }
            workout.setCreatedAt(now);
            workout.setUpdatedAt(now);
            return workout;
        }
    }

    /**
     * Executes an explicit atomic multi-step transaction using JDBC:
     * 1. Inserts the workout telemetry record.
     * 2. Updates the athlete's cumulative XP score.
     * 3. Commits the transaction, or rolls back completely if any statement fails.
     */
    public WorkoutLog createWorkoutWithXpTransaction(WorkoutLog workout, int xpAward) throws SQLException {
        String insertWorkoutSql = "INSERT INTO workout_logs (user_id, workout_type, duration_minutes, intensity, " +
                                  "calories_burned, volume_kg, logged_at, notes, record_type, created_at, updated_at, is_deleted) " +
                                  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        String updateUserXpSql = "UPDATE users SET total_xp = COALESCE(total_xp, 0) + ?, updated_at = ? WHERE id = ?";

        Connection conn = connectionManager.getConnection();
        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            conn.setAutoCommit(false); // Begin ACID Transaction

            // 1. Insert Workout
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime loggedTime = workout.getLoggedAt() != null ? workout.getLoggedAt() : now;

            try (PreparedStatement workoutStmt = conn.prepareStatement(insertWorkoutSql, Statement.RETURN_GENERATED_KEYS)) {
                workoutStmt.setLong(1, workout.getUser().getId());
                workoutStmt.setString(2, workout.getWorkoutType().name());
                workoutStmt.setInt(3, workout.getDurationMinutes());
                workoutStmt.setString(4, workout.getIntensity().name());
                workoutStmt.setInt(5, workout.getCaloriesBurned());
                workoutStmt.setDouble(6, workout.getVolumeKg() != null ? workout.getVolumeKg() : 0.0);
                workoutStmt.setTimestamp(7, Timestamp.valueOf(loggedTime));
                workoutStmt.setString(8, workout.getNotes());
                workoutStmt.setString(9, "LOG");
                workoutStmt.setTimestamp(10, Timestamp.valueOf(now));
                workoutStmt.setTimestamp(11, Timestamp.valueOf(now));
                workoutStmt.setBoolean(12, false);

                workoutStmt.executeUpdate();

                try (ResultSet rs = workoutStmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        workout.setId(rs.getLong(1));
                    }
                }
            }

            // 2. Award XP in same transaction
            if (xpAward > 0) {
                try (PreparedStatement xpStmt = conn.prepareStatement(updateUserXpSql)) {
                    xpStmt.setInt(1, xpAward);
                    xpStmt.setTimestamp(2, Timestamp.valueOf(now));
                    xpStmt.setLong(3, workout.getUser().getId());
                    xpStmt.executeUpdate();
                }
            }

            // 3. Commit Transaction
            conn.commit();
            workout.setCreatedAt(now);
            workout.setUpdatedAt(now);
            return workout;
        } catch (SQLException | RuntimeException ex) {
            // Rollback on any failure
            try {
                conn.rollback();
            } catch (SQLException rollbackEx) {
                ex.addSuppressed(rollbackEx);
            }
            throw ex;
        } finally {
            try {
                conn.setAutoCommit(originalAutoCommit);
            } catch (SQLException ignored) {}
            try {
                conn.close();
            } catch (SQLException ignored) {}
        }
    }

    /**
     * Finds a workout by primary key ID using PreparedStatement.
     */
    public Optional<WorkoutLog> findById(Long id) throws SQLException {
        String sql = "SELECT id, user_id, workout_type, duration_minutes, intensity, " +
                     "calories_burned, volume_kg, logged_at, notes, created_at, updated_at " +
                     "FROM workout_logs WHERE id = ? AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToWorkout(rs));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Retrieves all workouts for a specific user using PreparedStatement.
     */
    public List<WorkoutLog> findByUserId(Long userId) throws SQLException {
        String sql = "SELECT id, user_id, workout_type, duration_minutes, intensity, " +
                     "calories_burned, volume_kg, logged_at, notes, created_at, updated_at " +
                     "FROM workout_logs WHERE user_id = ? AND (is_deleted = false OR is_deleted IS NULL) " +
                     "ORDER BY logged_at DESC";

        List<WorkoutLog> list = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToWorkout(rs));
                }
            }
        }
        return list;
    }

    /**
     * Retrieves all workouts with pagination using PreparedStatement.
     */
    public List<WorkoutLog> findAll(int limit, int offset) throws SQLException {
        String sql = "SELECT id, user_id, workout_type, duration_minutes, intensity, " +
                     "calories_burned, volume_kg, logged_at, notes, created_at, updated_at " +
                     "FROM workout_logs WHERE (is_deleted = false OR is_deleted IS NULL) " +
                     "ORDER BY logged_at DESC LIMIT ? OFFSET ?";

        List<WorkoutLog> list = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Math.max(1, limit));
            stmt.setInt(2, Math.max(0, offset));

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToWorkout(rs));
                }
            }
        }
        return list;
    }

    /**
     * Updates an existing workout log using PreparedStatement.
     */
    public boolean update(WorkoutLog workout) throws SQLException {
        String sql = "UPDATE workout_logs SET workout_type = ?, duration_minutes = ?, intensity = ?, " +
                     "calories_burned = ?, volume_kg = ?, notes = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, workout.getWorkoutType().name());
            stmt.setInt(2, workout.getDurationMinutes());
            stmt.setString(3, workout.getIntensity().name());
            stmt.setInt(4, workout.getCaloriesBurned());
            stmt.setDouble(5, workout.getVolumeKg() != null ? workout.getVolumeKg() : 0.0);
            stmt.setString(6, workout.getNotes());
            stmt.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(8, workout.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Soft deletes a workout session using PreparedStatement.
     */
    public boolean delete(Long id) throws SQLException {
        String sql = "UPDATE workout_logs SET is_deleted = true, updated_at = ? WHERE id = ?";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(2, id);

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Counts workouts logged by a user using PreparedStatement.
     */
    public long countByUserId(Long userId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM workout_logs WHERE user_id = ? AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        }
        return 0;
    }

    /**
     * Sums total calories burned by a user using PreparedStatement.
     */
    public int sumCaloriesByUserId(Long userId) throws SQLException {
        String sql = "SELECT COALESCE(SUM(calories_burned), 0) FROM workout_logs WHERE user_id = ? AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }

    /**
     * Helper method to map ResultSet row to WorkoutLog entity.
     */
    private WorkoutLog mapRowToWorkout(ResultSet rs) throws SQLException {
        WorkoutLog w = new WorkoutLog();
        w.setId(rs.getLong("id"));

        Long userId = rs.getLong("user_id");
        User user = userJdbcDao.findById(userId).orElse(new User("Unknown", "unknown@fitpulse.local", "", null, null));
        w.setUser(user);

        String typeStr = rs.getString("workout_type");
        try {
            w.setWorkoutType(WorkoutType.valueOf(typeStr));
        } catch (Exception e) {
            w.setWorkoutType(WorkoutType.CARDIO);
        }

        w.setDurationMinutes(rs.getInt("duration_minutes"));

        String intStr = rs.getString("intensity");
        try {
            w.setIntensity(Intensity.valueOf(intStr));
        } catch (Exception e) {
            w.setIntensity(Intensity.MEDIUM);
        }

        w.setCaloriesBurned(rs.getInt("calories_burned"));
        w.setVolumeKg(rs.getDouble("volume_kg"));

        Timestamp loggedAtTs = rs.getTimestamp("logged_at");
        if (loggedAtTs != null) {
            w.setLoggedAt(loggedAtTs.toLocalDateTime());
        }

        w.setNotes(rs.getString("notes"));

        Timestamp createdAtTs = rs.getTimestamp("created_at");
        if (createdAtTs != null) {
            w.setCreatedAt(createdAtTs.toLocalDateTime());
        }
        Timestamp updatedAtTs = rs.getTimestamp("updated_at");
        if (updatedAtTs != null) {
            w.setUpdatedAt(updatedAtTs.toLocalDateTime());
        }

        return w;
    }
}
