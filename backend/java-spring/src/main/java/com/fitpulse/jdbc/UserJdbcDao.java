package com.fitpulse.jdbc;

import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Native JDBC Data Access Object for User entities.
 * Demonstrates:
 * - Real JDBC Integration using java.sql.Connection, PreparedStatement, and ResultSet.
 * - Comprehensive CRUD operations (Create, Read, Update, Delete).
 * - Safe parameterized PreparedStatement queries (Zero SQL Injection vulnerabilities).
 * - Proper SQLException handling and resource lifecycle management.
 */
@Repository
public class UserJdbcDao {

    private final JdbcConnectionManager connectionManager;

    public UserJdbcDao(JdbcConnectionManager connectionManager) {
        this.connectionManager = connectionManager;
    }

    /**
     * Inserts a new athlete or administrator record using PreparedStatement with generated keys.
     */
    public User create(User user) throws SQLException {
        String sql = "INSERT INTO users (name, email, password_hash, role, avatar_url, is_active, total_xp, created_at, updated_at, is_deleted) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();
            stmt.setString(1, user.getName());
            stmt.setString(2, user.getEmail().toLowerCase().trim());
            stmt.setString(3, user.getPasswordHash());
            stmt.setString(4, user.getRole() != null ? user.getRole().name() : Role.USER.name());
            stmt.setString(5, user.getAvatarUrl());
            stmt.setBoolean(6, user.getIsActive() != null ? user.getIsActive() : true);
            stmt.setInt(7, user.getTotalXp() != null ? user.getTotalXp() : 0);
            stmt.setTimestamp(8, Timestamp.valueOf(now));
            stmt.setTimestamp(9, Timestamp.valueOf(now));
            stmt.setBoolean(10, false);

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    user.setId(generatedKeys.getLong(1));
                }
            }
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            return user;
        }
    }

    /**
     * Finds a user by primary key ID using PreparedStatement and ResultSet.
     */
    public Optional<User> findById(Long id) throws SQLException {
        String sql = "SELECT id, name, email, password_hash, role, avatar_url, is_active, total_xp, created_at, updated_at " +
                     "FROM users WHERE id = ? AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Finds a user by unique email address using PreparedStatement.
     */
    public Optional<User> findByEmail(String email) throws SQLException {
        String sql = "SELECT id, name, email, password_hash, role, avatar_url, is_active, total_xp, created_at, updated_at " +
                     "FROM users WHERE LOWER(email) = LOWER(?) AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email.trim());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Retrieves all active users with pagination using PreparedStatement.
     */
    public List<User> findAll(int limit, int offset) throws SQLException {
        String sql = "SELECT id, name, email, password_hash, role, avatar_url, is_active, total_xp, created_at, updated_at " +
                     "FROM users WHERE (is_deleted = false OR is_deleted IS NULL) ORDER BY id ASC LIMIT ? OFFSET ?";

        List<User> users = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Math.max(1, limit));
            stmt.setInt(2, Math.max(0, offset));

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    users.add(mapRowToUser(rs));
                }
            }
        }
        return users;
    }

    /**
     * Updates an existing user record using PreparedStatement.
     */
    public boolean update(User user) throws SQLException {
        String sql = "UPDATE users SET name = ?, avatar_url = ?, role = ?, is_active = ?, total_xp = ?, updated_at = ? " +
                     "WHERE id = ? AND (is_deleted = false OR is_deleted IS NULL)";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getName());
            stmt.setString(2, user.getAvatarUrl());
            stmt.setString(3, user.getRole() != null ? user.getRole().name() : Role.USER.name());
            stmt.setBoolean(4, user.getIsActive() != null ? user.getIsActive() : true);
            stmt.setInt(5, user.getTotalXp() != null ? user.getTotalXp() : 0);
            stmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(7, user.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Soft deletes a user record using PreparedStatement.
     */
    public boolean delete(Long id) throws SQLException {
        String sql = "UPDATE users SET is_deleted = true, updated_at = ? WHERE id = ?";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(2, id);

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Increments user XP points.
     */
    public boolean addXp(Long userId, int xpAmount) throws SQLException {
        String sql = "UPDATE users SET total_xp = COALESCE(total_xp, 0) + ?, updated_at = ? WHERE id = ?";

        try (Connection conn = connectionManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, xpAmount);
            stmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(3, userId);

            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Helper method to map a ResultSet row to a User entity.
     */
    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));

        String roleStr = rs.getString("role");
        try {
            user.setRole(roleStr != null ? Role.valueOf(roleStr) : Role.USER);
        } catch (IllegalArgumentException e) {
            user.setRole(Role.USER);
        }

        user.setAvatarUrl(rs.getString("avatar_url"));
        user.setIsActive(rs.getBoolean("is_active"));
        user.setTotalXp(rs.getInt("total_xp"));

        Timestamp createdAtTs = rs.getTimestamp("created_at");
        if (createdAtTs != null) {
            user.setCreatedAt(createdAtTs.toLocalDateTime());
        }
        Timestamp updatedAtTs = rs.getTimestamp("updated_at");
        if (updatedAtTs != null) {
            user.setUpdatedAt(updatedAtTs.toLocalDateTime());
        }

        return user;
    }
}
