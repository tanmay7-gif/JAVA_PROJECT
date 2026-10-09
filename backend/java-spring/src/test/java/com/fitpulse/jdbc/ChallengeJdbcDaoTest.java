package com.fitpulse.jdbc;

import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
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
public class ChallengeJdbcDaoTest {

    @Mock
    private JdbcConnectionManager connectionManager;

    @Mock
    private Connection mockConnection;

    @Mock
    private PreparedStatement mockCheckStmt;

    @Mock
    private PreparedStatement mockEnrollStmt;

    @Mock
    private PreparedStatement mockAuditStmt;

    @Mock
    private ResultSet mockCheckRs;

    private ChallengeJdbcDao challengeJdbcDao;

    @BeforeEach
    void setUp() throws SQLException {
        challengeJdbcDao = new ChallengeJdbcDao(connectionManager);
        when(connectionManager.getConnection()).thenReturn(mockConnection);
    }

    @Test
    @DisplayName("enrollUserInChallengeWithTransaction should commit when not already enrolled")
    void testEnroll_Success() throws SQLException {
        when(mockConnection.getAutoCommit()).thenReturn(true);
        when(mockConnection.prepareStatement(startsWith("SELECT COUNT(*) FROM user_challenges")))
                .thenReturn(mockCheckStmt);
        when(mockConnection.prepareStatement(startsWith("INSERT INTO user_challenges")))
                .thenReturn(mockEnrollStmt);
        when(mockConnection.prepareStatement(startsWith("INSERT INTO activity_logs")))
                .thenReturn(mockAuditStmt);

        when(mockCheckStmt.executeQuery()).thenReturn(mockCheckRs);
        when(mockCheckRs.next()).thenReturn(true);
        when(mockCheckRs.getInt(1)).thenReturn(0); // Not enrolled yet

        when(mockEnrollStmt.executeUpdate()).thenReturn(1);
        when(mockAuditStmt.executeUpdate()).thenReturn(1);

        boolean enrolled = challengeJdbcDao.enrollUserInChallengeWithTransaction(1L, 10L);

        assertTrue(enrolled);
        verify(mockConnection).setAutoCommit(false);
        verify(mockConnection).commit();
        verify(mockConnection, never()).rollback();
        verify(mockConnection).close();
    }

    @Test
    @DisplayName("enrollUserInChallengeWithTransaction should rollback if already enrolled")
    void testEnroll_AlreadyEnrolled() throws SQLException {
        when(mockConnection.getAutoCommit()).thenReturn(true);
        when(mockConnection.prepareStatement(startsWith("SELECT COUNT(*) FROM user_challenges")))
                .thenReturn(mockCheckStmt);

        when(mockCheckStmt.executeQuery()).thenReturn(mockCheckRs);
        when(mockCheckRs.next()).thenReturn(true);
        when(mockCheckRs.getInt(1)).thenReturn(1); // Already enrolled

        boolean enrolled = challengeJdbcDao.enrollUserInChallengeWithTransaction(1L, 10L);

        assertFalse(enrolled);
        verify(mockConnection).setAutoCommit(false);
        verify(mockConnection).rollback();
        verify(mockConnection, never()).commit();
        verify(mockConnection).close();
    }

    @Test
    @DisplayName("enrollUserInChallengeWithTransaction should rollback on SQLException")
    void testEnroll_RollbackOnError() throws SQLException {
        when(mockConnection.getAutoCommit()).thenReturn(true);
        when(mockConnection.prepareStatement(startsWith("SELECT COUNT(*) FROM user_challenges")))
                .thenReturn(mockCheckStmt);
        when(mockConnection.prepareStatement(startsWith("INSERT INTO user_challenges")))
                .thenReturn(mockEnrollStmt);

        when(mockCheckStmt.executeQuery()).thenReturn(mockCheckRs);
        when(mockCheckRs.next()).thenReturn(true);
        when(mockCheckRs.getInt(1)).thenReturn(0);

        when(mockEnrollStmt.executeUpdate()).thenThrow(new SQLException("Constraint violation error"));

        assertThrows(SQLException.class, () ->
                challengeJdbcDao.enrollUserInChallengeWithTransaction(1L, 10L));

        verify(mockConnection).setAutoCommit(false);
        verify(mockConnection).rollback();
        verify(mockConnection, never()).commit();
        verify(mockConnection).close();
    }
}
