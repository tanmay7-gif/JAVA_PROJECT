package com.fitpulse.service.jdbc;

import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service interface for User operations executed through the JDBC layer.
 * Enforces the architectural flow: Request → Servlet → Service → JDBC Repository → Database.
 */
public interface IUserJdbcService {

    List<User> getAllUsers(int limit, int offset) throws SQLException;

    Optional<User> getUserById(Long id) throws SQLException;

    Optional<User> getUserByEmail(String email) throws SQLException;

    User registerUser(String name, String email, String rawPassword, Role role, String avatarUrl) throws SQLException;

    boolean updateUser(Long userId, Map<String, Object> updates) throws SQLException;

    boolean deleteUser(Long userId) throws SQLException;

    boolean awardXp(Long userId, int xpAmount) throws SQLException;
}
