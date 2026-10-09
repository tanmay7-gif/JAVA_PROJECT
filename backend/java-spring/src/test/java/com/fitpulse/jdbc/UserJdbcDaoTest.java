package com.fitpulse.jdbc;

import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.*;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserJdbcDaoTest {

    @Mock
    private JdbcConnectionManager connectionManager;

    @Mock
    private Connection mockConnection;

    @Mock
    private PreparedStatement mockStatement;

    @Mock
    private ResultSet mockResultSet;

    @Mock
    private ResultSet mockGeneratedKeys;

    private UserJdbcDao userJdbcDao;

    @BeforeEach
    void setUp() throws SQLException {
        userJdbcDao = new UserJdbcDao(connectionManager);
        when(connectionManager.getConnection()).thenReturn(mockConnection);
    }

    @Test
    @DisplayName("create should execute PreparedStatement with generated keys and set User ID")
    void testCreate_Success() throws SQLException {
        when(mockConnection.prepareStatement(anyString(), eq(Statement.RETURN_GENERATED_KEYS)))
                .thenReturn(mockStatement);
        when(mockStatement.executeUpdate()).thenReturn(1);
        when(mockStatement.getGeneratedKeys()).thenReturn(mockGeneratedKeys);
        when(mockGeneratedKeys.next()).thenReturn(true);
        when(mockGeneratedKeys.getLong(1)).thenReturn(42L);

        User newUser = new User("Sam Fisher", "sam@fitpulse.com", "hash", Role.USER, null);
        User result = userJdbcDao.create(newUser);

        assertNotNull(result);
        assertEquals(42L, result.getId());
        verify(mockStatement).setString(eq(1), eq("Sam Fisher"));
        verify(mockStatement).setString(eq(2), eq("sam@fitpulse.com"));
        verify(mockStatement).executeUpdate();
    }

    @Test
    @DisplayName("findById should execute PreparedStatement with parameter and map ResultSet to User")
    void testFindById_Found() throws SQLException {
        when(mockConnection.prepareStatement(anyString())).thenReturn(mockStatement);
        when(mockStatement.executeQuery()).thenReturn(mockResultSet);
        when(mockResultSet.next()).thenReturn(true);
        when(mockResultSet.getLong("id")).thenReturn(42L);
        when(mockResultSet.getString("name")).thenReturn("Sam Fisher");
        when(mockResultSet.getString("email")).thenReturn("sam@fitpulse.com");
        when(mockResultSet.getString("password_hash")).thenReturn("hash");
        when(mockResultSet.getString("role")).thenReturn("USER");
        when(mockResultSet.getBoolean("is_active")).thenReturn(true);
        when(mockResultSet.getInt("total_xp")).thenReturn(100);

        Optional<User> userOpt = userJdbcDao.findById(42L);

        assertTrue(userOpt.isPresent());
        assertEquals("Sam Fisher", userOpt.get().getName());
        assertEquals("sam@fitpulse.com", userOpt.get().getEmail());
        verify(mockStatement).setLong(1, 42L);
    }

    @Test
    @DisplayName("update should execute update PreparedStatement and return true when rows affected")
    void testUpdate_Success() throws SQLException {
        when(mockConnection.prepareStatement(anyString())).thenReturn(mockStatement);
        when(mockStatement.executeUpdate()).thenReturn(1);

        User user = new User("Updated Sam", "sam@fitpulse.com", "hash", Role.USER, null);
        user.setId(42L);

        boolean updated = userJdbcDao.update(user);

        assertTrue(updated);
        verify(mockStatement).setString(1, "Updated Sam");
        verify(mockStatement).setLong(7, 42L);
    }

    @Test
    @DisplayName("delete should execute soft delete PreparedStatement and return true")
    void testDelete_Success() throws SQLException {
        when(mockConnection.prepareStatement(anyString())).thenReturn(mockStatement);
        when(mockStatement.executeUpdate()).thenReturn(1);

        boolean deleted = userJdbcDao.delete(42L);

        assertTrue(deleted);
        verify(mockStatement).setLong(2, 42L);
    }
}
