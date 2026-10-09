package com.fitpulse.jdbc;

import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Native JDBC Data Access Object for Challenge entities.
 * Demonstrates:
 * - Real JDBC Integration using java.sql.Connection, PreparedStatement, and ResultSet.
 * - Comprehensive CRUD operations (Create, Read, Update, Delete).
 * - Safe parameterized PreparedStatement queries.
 * - Atomic Multi-table Transaction with explicit commit/rollback for enrollment.
 */
@Repository
public class ChallengeJdbcDao {

    private final JdbcConnectionManager connectionManager;

    public ChallengeJdbcDao(JdbcConnectionManager connectionManager) {
        this.connectionManager = connectionManager;
    }

    /**
     * Inserts a new fitness challenge using PreparedStatement with generated keys.
     */
    public FitnessChallenge create(FitnessChallenge challenge) throws SQLException {
        String sql = "INSERT INTO fitness_challenges (title, description, target_metric, target_value, " +
                     "start_date, end_date, badge_icon_url, reward_badge, reward_xp, status, challenge_type, " +
                     "created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();
            stmt.setString(1, challenge.getTitle());
            stmt.setString(2, challenge.getDescription());
            stmt.setString(3, challenge.getTargetMetric().name());
            stmt.setInt(4, challenge.getTargetValue());
            stmt.setTimestamp(5, Timestamp.valueOf(challenge.getStartDate() != null ? challenge.getStartDate() : now));
            stmt.setTimestamp(6, Timestamp.valueOf(challenge.getEndDate() != null ? challenge.getEndDate() : now.plusDays(30)));
            stmt.setString(7, challenge.getBadgeIconUrl());
            stmt.setString(8, challenge.getRewardBadge());
            stmt.setInt(9, challenge.getRewardXp() != null ? challenge.getRewardXp() : 250);
            stmt.setString(10, challenge.getStatus() != null ? challenge.getStatus().name() : ChallengeStatus.ACTIVE.name());
            stmt.setString(11, "COMMUNITY");
            stmt.setTimestamp(12, Timestamp.valueOf(now));
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setBoolean(14, false);

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating challenge failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    challenge.setId(generatedKeys.getLong(1));
                }
            }
            challenge.setCreatedAt(now);
            challenge.setUpdatedAt(now);
            return challenge;
        }
    }

    /**
     * Finds a challenge by primary key ID using PreparedStatement.
     */
    public Optional<FitnessChallenge> findById(Long id) throws SQLException {
        String sql = "SELECT id, title, description, target_metric, target_value, start_date, end_date, " +
                     "badge_icon_url, reward_badge, reward_xp, status, created_at, updated_at " +
                     "FROM fitness_challenges WHERE id = ? AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToChallenge(rs));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Retrieves all challenges using PreparedStatement.
     */
    public List<FitnessChallenge> findAll() throws SQLException {
        String sql = "SELECT id, title, description, target_metric, target_value, start_date, end_date, " +
                     "badge_icon_url, reward_badge, reward_xp, status, created_at, updated_at " +
                     "FROM fitness_challenges WHERE (is_deleted = false OR is_deleted IS NULL) " +
                     "ORDER BY start_date DESC";

        List<FitnessChallenge> list = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapRowToChallenge(rs));
            }
        }
        return list;
    }

    /**
     * Retrieves currently active challenges whose end date is in the future.
     */
    public List<FitnessChallenge> findActive() throws SQLException {
        String sql = "SELECT id, title, description, target_metric, target_value, start_date, end_date, " +
                     "badge_icon_url, reward_badge, reward_xp, status, created_at, updated_at " +
                     "FROM fitness_challenges WHERE end_date >= ? AND (is_deleted = false OR is_deleted IS NULL) " +
                     "ORDER BY start_date ASC";

        List<FitnessChallenge> list = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToChallenge(rs));
                }
            }
        }
        return list;
    }

    /**
     * Updates an existing challenge record using PreparedStatement.
     */
    public boolean update(FitnessChallenge challenge) throws SQLException {
        String sql = "UPDATE fitness_challenges SET title = ?, description = ?, target_metric = ?, " +
                     "target_value = ?, reward_xp = ?, status = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, challenge.getTitle());
            stmt.setString(2, challenge.getDescription());
            stmt.setString(3, challenge.getTargetMetric().name());
            stmt.setInt(4, challenge.getTargetValue());
            stmt.setInt(5, challenge.getRewardXp() != null ? challenge.getRewardXp() : 250);
            stmt.setString(6, challenge.getStatus() != null ? challenge.getStatus().name() : ChallengeStatus.ACTIVE.name());
            stmt.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(8, challenge.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Soft deletes a challenge using PreparedStatement.
     */
    public boolean delete(Long id) throws SQLException {
        String sql = "UPDATE fitness_challenges SET is_deleted = true, updated_at = ? WHERE id = ?";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(2, id);

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Enrolls an athlete into a challenge inside an atomic transaction:
     * 1. Checks if already enrolled.
     * 2. Inserts enrollment record into user_challenges.
     * 3. Inserts activity audit record.
     * 4. Commits transaction, or rolls back on SQLException.
     */
    public boolean enrollUserInChallengeWithTransaction(Long userId, Long challengeId) throws SQLException {
        String checkSql = "SELECT COUNT(*) FROM user_challenges WHERE user_id = ? AND challenge_id = ?";
        String insertEnrollmentSql = "INSERT INTO user_challenges (user_id, challenge_id, status, current_progress, " +
                                     "created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)";
        String insertAuditSql = "INSERT INTO activity_logs (user_id, user_email, activity_type, description, " +
                                "entity_type, entity_id, ip_address, timestamp, created_at, updated_at, is_deleted) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = connectionManager.getConnection();
        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            conn.setAutoCommit(false); // Begin ACID Transaction

            // Check existing
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setLong(1, userId);
                checkStmt.setLong(2, challengeId);
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (rs.next() && rs.getInt(1) > 0) {
                        conn.rollback();
                        return false; // Already enrolled
                    }
                }
            }

            LocalDateTime now = LocalDateTime.now();

            // Insert Enrollment
            try (PreparedStatement enrollStmt = conn.prepareStatement(insertEnrollmentSql)) {
                enrollStmt.setLong(1, userId);
                enrollStmt.setLong(2, challengeId);
                enrollStmt.setString(3, ChallengeStatus.IN_PROGRESS.name());
                enrollStmt.setInt(4, 0);
                enrollStmt.setTimestamp(5, Timestamp.valueOf(now));
                enrollStmt.setTimestamp(6, Timestamp.valueOf(now));
                enrollStmt.setBoolean(7, false);
                enrollStmt.executeUpdate();
            }

            // Insert Audit Log
            try (PreparedStatement auditStmt = conn.prepareStatement(insertAuditSql)) {
                auditStmt.setLong(1, userId);
                auditStmt.setString(2, "athlete@fitpulse.local");
                auditStmt.setString(3, "CHALLENGE_ENROLLED");
                auditStmt.setString(4, "User enrolled in challenge #" + challengeId);
                auditStmt.setString(5, "CHALLENGE");
                auditStmt.setLong(6, challengeId);
                auditStmt.setString(7, "127.0.0.1");
                auditStmt.setTimestamp(8, Timestamp.valueOf(now));
                auditStmt.setTimestamp(9, Timestamp.valueOf(now));
                auditStmt.setTimestamp(10, Timestamp.valueOf(now));
                auditStmt.setBoolean(11, false);
                auditStmt.executeUpdate();
            }

            conn.commit(); // Commit Transaction
            return true;
        } catch (SQLException | RuntimeException ex) {
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
     * Helper method to map ResultSet row to FitnessChallenge entity.
     */
    private FitnessChallenge mapRowToChallenge(ResultSet rs) throws SQLException {
        FitnessChallenge c = new FitnessChallenge();
        c.setId(rs.getLong("id"));
        c.setTitle(rs.getString("title"));
        c.setDescription(rs.getString("description"));

        String metricStr = rs.getString("target_metric");
        try {
            c.setTargetMetric(TargetMetric.valueOf(metricStr));
        } catch (Exception e) {
            c.setTargetMetric(TargetMetric.CALORIES);
        }

        c.setTargetValue(rs.getInt("target_value"));

        Timestamp startTs = rs.getTimestamp("start_date");
        if (startTs != null) {
            c.setStartDate(startTs.toLocalDateTime());
        }

        Timestamp endTs = rs.getTimestamp("end_date");
        if (endTs != null) {
            c.setEndDate(endTs.toLocalDateTime());
        }

        c.setBadgeIconUrl(rs.getString("badge_icon_url"));
        c.setRewardBadge(rs.getString("reward_badge"));
        c.setRewardXp(rs.getInt("reward_xp"));

        String statusStr = rs.getString("status");
        try {
            c.setStatus(ChallengeStatus.valueOf(statusStr));
        } catch (Exception e) {
            c.setStatus(ChallengeStatus.ACTIVE);
        }

        Timestamp createdAtTs = rs.getTimestamp("created_at");
        if (createdAtTs != null) {
            c.setCreatedAt(createdAtTs.toLocalDateTime());
        }
        Timestamp updatedAtTs = rs.getTimestamp("updated_at");
        if (updatedAtTs != null) {
            c.setUpdatedAt(updatedAtTs.toLocalDateTime());
        }

        return c;
    }
}
