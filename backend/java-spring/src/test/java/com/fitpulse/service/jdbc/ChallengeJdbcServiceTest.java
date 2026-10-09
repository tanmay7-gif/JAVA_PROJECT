package com.fitpulse.service.jdbc;

import com.fitpulse.jdbc.ChallengeJdbcDao;
import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChallengeJdbcServiceTest {

    @Mock
    private ChallengeJdbcDao challengeJdbcDao;

    @InjectMocks
    private ChallengeJdbcService challengeJdbcService;

    private FitnessChallenge sampleChallenge;

    @BeforeEach
    void setUp() {
        sampleChallenge = new FitnessChallenge("Cardio Blitz", "Run 100km", TargetMetric.TOTAL_DISTANCE_KM, 100,
                LocalDateTime.now(), LocalDateTime.now().plusDays(30), null, "RUNNER", 350, ChallengeStatus.ACTIVE);
        sampleChallenge.setId(5L);
    }

    @Test
    @DisplayName("getAllChallenges should delegate to challengeJdbcDao.findAll")
    void testGetAllChallenges() throws SQLException {
        when(challengeJdbcDao.findAll()).thenReturn(List.of(sampleChallenge));

        List<FitnessChallenge> result = challengeJdbcService.getAllChallenges();

        assertEquals(1, result.size());
        assertEquals("Cardio Blitz", result.get(0).getTitle());
        verify(challengeJdbcDao).findAll();
    }

    @Test
    @DisplayName("getActiveChallenges should delegate to challengeJdbcDao.findActive")
    void testGetActiveChallenges() throws SQLException {
        when(challengeJdbcDao.findActive()).thenReturn(List.of(sampleChallenge));

        List<FitnessChallenge> result = challengeJdbcService.getActiveChallenges();

        assertEquals(1, result.size());
        verify(challengeJdbcDao).findActive();
    }

    @Test
    @DisplayName("createChallenge should validate input and delegate to challengeJdbcDao.create")
    void testCreateChallenge_Success() throws SQLException {
        when(challengeJdbcDao.create(any(FitnessChallenge.class))).thenAnswer(invocation -> {
            FitnessChallenge c = invocation.getArgument(0);
            c.setId(6L);
            return c;
        });

        FitnessChallenge newChallenge = new FitnessChallenge();
        newChallenge.setTitle("Summer Sculpt");
        newChallenge.setTargetMetric(TargetMetric.CALORIES_BURNED);
        newChallenge.setTargetValue(4000);

        FitnessChallenge created = challengeJdbcService.createChallenge(newChallenge);

        assertNotNull(created);
        assertEquals(6L, created.getId());
        assertEquals("Summer Sculpt", created.getTitle());
        verify(challengeJdbcDao).create(newChallenge);
    }

    @Test
    @DisplayName("enrollAthleteInChallenge should delegate to challengeJdbcDao.enrollUserInChallengeWithTransaction")
    void testEnrollAthleteInChallenge_Success() throws SQLException {
        when(challengeJdbcDao.enrollUserInChallengeWithTransaction(10L, 5L)).thenReturn(true);

        boolean enrolled = challengeJdbcService.enrollAthleteInChallenge(10L, 5L);

        assertTrue(enrolled);
        verify(challengeJdbcDao).enrollUserInChallengeWithTransaction(10L, 5L);
    }

    @Test
    @DisplayName("updateChallenge should update fields and call challengeJdbcDao.update")
    void testUpdateChallenge_Success() throws SQLException {
        when(challengeJdbcDao.findById(5L)).thenReturn(Optional.of(sampleChallenge));
        when(challengeJdbcDao.update(any(FitnessChallenge.class))).thenReturn(true);

        boolean updated = challengeJdbcService.updateChallenge(5L, Map.of("title", "Cardio Blitz Ultra", "rewardXp", 500));

        assertTrue(updated);
        assertEquals("Cardio Blitz Ultra", sampleChallenge.getTitle());
        assertEquals(500, sampleChallenge.getRewardXp());
        verify(challengeJdbcDao).update(sampleChallenge);
    }

    @Test
    @DisplayName("deleteChallenge should delegate to challengeJdbcDao.delete")
    void testDeleteChallenge() throws SQLException {
        when(challengeJdbcDao.delete(5L)).thenReturn(true);

        boolean deleted = challengeJdbcService.deleteChallenge(5L);

        assertTrue(deleted);
        verify(challengeJdbcDao).delete(5L);
    }
}
