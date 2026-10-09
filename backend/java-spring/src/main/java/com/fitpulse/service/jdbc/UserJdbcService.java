package com.fitpulse.service.jdbc;

import com.fitpulse.jdbc.UserJdbcDao;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Concrete implementation of IUserJdbcService.
 * Connects the Servlet web layer with the native JDBC Data Access Object layer.
 * Flow: Request → Servlet → UserJdbcService → UserJdbcDao → Database.
 */
@Service
public class UserJdbcService implements IUserJdbcService {

    private final UserJdbcDao userJdbcDao;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserJdbcService(UserJdbcDao userJdbcDao) {
        this.userJdbcDao = userJdbcDao;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public List<User> getAllUsers(int limit, int offset) throws SQLException {
        return userJdbcDao.findAll(limit, offset);
    }

    @Override
    public Optional<User> getUserById(Long id) throws SQLException {
        return userJdbcDao.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) throws SQLException {
        return userJdbcDao.findByEmail(email);
    }

    @Override
    public User registerUser(String name, String email, String rawPassword, Role role, String avatarUrl) throws SQLException {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("User name must not be blank");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Valid email address is required");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        Optional<User> existing = userJdbcDao.findByEmail(email);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        String passwordHash = passwordEncoder.encode(rawPassword);
        Role userRole = role != null ? role : Role.USER;
        User newUser = new User(name.trim(), email.toLowerCase().trim(), passwordHash, userRole, avatarUrl);
        return userJdbcDao.create(newUser);
    }

    @Override
    public boolean updateUser(Long userId, Map<String, Object> updates) throws SQLException {
        Optional<User> userOpt = userJdbcDao.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        if (updates.containsKey("name")) {
            String name = (String) updates.get("name");
            if (name != null && !name.isBlank()) user.setName(name.trim());
        }
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl((String) updates.get("avatarUrl"));
        }
        if (updates.containsKey("isActive")) {
            user.setIsActive((Boolean) updates.get("isActive"));
        }
        if (updates.containsKey("role")) {
            try {
                user.setRole(Role.valueOf(((String) updates.get("role")).trim().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (updates.containsKey("totalXp")) {
            Number xp = (Number) updates.get("totalXp");
            if (xp != null) user.setTotalXp(xp.intValue());
        }

        return userJdbcDao.update(user);
    }

    @Override
    public boolean deleteUser(Long userId) throws SQLException {
        return userJdbcDao.delete(userId);
    }

    @Override
    public boolean awardXp(Long userId, int xpAmount) throws SQLException {
        return userJdbcDao.addXp(userId, xpAmount);
    }
}
