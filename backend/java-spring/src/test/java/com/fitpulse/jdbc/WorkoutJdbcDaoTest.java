package com.fitpulse.jdbc;

import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.Role;
import com.fitpulse.model.enums.WorkoutType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.*;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkoutJdbcDaoTest {

    @Mock
    private JdbcConnectionManager connectionManager;

    @Mock
    private UserJdbcDao userJdbcDao;

    @Mock
    private Connection mockConnection;

    @Mock
    private PreparedStatement mockWorkoutStmt;

    @Mock
    private PreparedStatement mockXpStmt;

    @Mock
    private ResultSet mockGeneratedKeys;

    private WorkoutJdbcDao workoutJdbcDao;
    private User mockUser;

    @BeforeEach
    void setUp() throws SQLException {
        workoutJdbcDao = new WorkoutJdbcDao(connectionManager, userJdbcDao);
        when(connectionManager.getConnection()).thenReturn(mockConnection);

        mockUser = new User("Athlete", "athlete@fitpulse.com", "hash", Role.USER, null);
        mockUser.setId(10L);
    }

    @Test
    @DisplayName("createWorkoutWithXpTransaction should commit transaction on success")
    void testCreateWorkoutWithXpTransaction_Success() throws SQLException {
        when(mockConnection.getAutoCommit()).thenReturn(true);
        when(mockConnection.prepareStatement(startsWith("INSERT INTO workout_logs"), eq(Statement.RETURN_GENERATED_KEYS)))
                .thenReturn(mockWorkoutStmt);
        when(mockConnection.prepareStatement(startsWith("UPDATE users SET total_xp")))
                .thenReturn(mockXpStmt);

        when(mockWorkoutStmt.executeUpdate()).thenReturn(1);
        when(mockWorkoutStmt.getGeneratedKeys()).thenReturn(mockGeneratedKeys);
        when(mockGeneratedKeys.next()).thenReturn(true);
        when(mockGeneratedKeys.getLong(1)).thenReturn(99L);
        when(mockXpStmt.executeUpdate()).thenReturn(1);

        WorkoutLog log = new WorkoutLog(mockUser, WorkoutType.STRENGTH, 45, Intensity.HIGH, 350, 1200.0, LocalDateTime.now(), "Upper body");
        WorkoutLog result = workoutJdbcDao.createWorkoutWithXpTransaction(log, 50);

        assertNotNull(result);
        assertEquals(99L, result.getId());

        // Verify transaction semantics
        verify(mockConnection).setAutoCommit(false);
        verify(mockConnection).commit();
        verify(mockConnection, never()).rollback();
        verify(mockConnection).setAutoCommit(true); // Restored
        verify(mockConnection).close();
    }

    @Test
    @DisplayName("createWorkoutWithXpTransaction should rollback transaction on SQLException")
    void testCreateWorkoutWithXpTransaction_RollbackOnError() throws SQLException {
        when(mockConnection.getAutoCommit()).thenReturn(true);
        when(mockConnection.prepareStatement(startsWith("INSERT INTO workout_logs"), eq(Statement.RETURN_GENERATED_KEYS)))
                .thenReturn(mockWorkoutStmt);
        when(mockWorkoutStmt.executeUpdate()).thenThrow(new SQLException("Simulated database disk failure"));

        WorkoutLog log = new WorkoutLog(mockUser, WorkoutType.STRENGTH, 45, Intensity.HIGH, 350, 1200.0, LocalDateTime.now(), "Upper body");

        assertThrows(SQLException.class, () -> workoutJdbcDao.createWorkoutWithXpTransaction(log, 50));

        // Verify rollback called
        verify(mockConnection).setAutoCommit(false);
        verify(mockConnection, never()).commit();
        verify(mockConnection).rollback();
        verify(mockConnection).close();
    }
}
