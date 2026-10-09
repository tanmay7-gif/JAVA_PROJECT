package com.fitpulse.service;

import com.fitpulse.dto.ChallengeDtos.*;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.User;
import com.fitpulse.model.UserChallenge;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.Role;
import com.fitpulse.model.enums.TargetMetric;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.repository.FitnessChallengeRepository;
import com.fitpulse.repository.UserChallengeRepository;
import com.fitpulse.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChallengeServiceTest {

    @Mock
    private FitnessChallengeRepository challengeRepository;

    @Mock
    private UserChallengeRepository userChallengeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private IActivityLogService activityLogService;

    @InjectMocks
    private ChallengeService challengeService;

    private User mockUser;
    private FitnessChallenge mockChallenge;

    @BeforeEach
    void setUp() {
        mockUser = new User("Sarah Connor", "sarah@fitpulse.com", "hash", Role.USER, "avatar.png");
        mockUser.setId(1L);

        mockChallenge = new FitnessChallenge(
                "5,000 kcal Metabolic Burn",
                "Burn 5,000 active calories",
                TargetMetric.CALORIES,
                5000,
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(30),
                "badge.png",
                "Metabolic Inferno",
                500
        );
        mockChallenge.setId(10L);
    }

    @Test
    @DisplayName("Admin: Create Challenge saves entity and logs audit")
    void testCreateChallenge_AdminSuccess() {
        ChallengeCreateRequest req = new ChallengeCreateRequest();
        req.setTitle("Century Cycling Challenge");
        req.setDescription("Ride 100km or 180 min");
        req.setTargetMetric(TargetMetric.DURATION);
        req.setTargetValue(180);
        req.setStartDate(LocalDateTime.now());
        req.setEndDate(LocalDateTime.now().plusDays(14));
        req.setRewardBadge("Century Rider");
        req.setRewardXp(350);

        when(challengeRepository.save(any(FitnessChallenge.class))).thenAnswer(inv -> {
            FitnessChallenge fc = inv.getArgument(0);
            fc.setId(20L);
            return fc;
        });

        ChallengeResponse response = challengeService.createChallenge(req);

        assertNotNull(response);
        assertEquals(20L, response.getId());
        assertEquals("Century Cycling Challenge", response.getTitle());
        assertEquals(TargetMetric.DURATION, response.getTargetMetric());
        verify(challengeRepository, times(1)).save(any(FitnessChallenge.class));
        verify(activityLogService, times(1)).logActivity(isNull(), eq(com.fitpulse.model.enums.ActivityType.CHALLENGE_CREATED), anyString(), eq("CHALLENGE"), eq(20L));
    }

    @Test
    @DisplayName("Admin: Update Challenge modifies parameters and persists")
    void testUpdateChallenge_AdminSuccess() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(mockChallenge));
        when(challengeRepository.save(any(FitnessChallenge.class))).thenAnswer(inv -> inv.getArgument(0));

        ChallengeUpdateRequest req = new ChallengeUpdateRequest();
        req.setTitle("6,000 kcal Extreme Burn");
        req.setTargetValue(6000);
        req.setRewardBadge("Inferno Titan");

        ChallengeResponse response = challengeService.updateChallenge(10L, req);

        assertNotNull(response);
        assertEquals("6,000 kcal Extreme Burn", response.getTitle());
        assertEquals(6000, response.getTargetValue());
        assertEquals("Inferno Titan", response.getRewardBadge());
        verify(challengeRepository, times(1)).save(mockChallenge);
        verify(activityLogService, times(1)).logActivity(isNull(), eq(com.fitpulse.model.enums.ActivityType.CHALLENGE_UPDATED), anyString(), eq("CHALLENGE"), eq(10L));
    }

    @Test
    @DisplayName("Admin: Delete Challenge purges user enrollments and deletes entity")
    void testDeleteChallenge_AdminSuccess() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(mockChallenge));

        challengeService.deleteChallenge(10L);

        verify(userChallengeRepository, times(1)).deleteByChallenge(mockChallenge);
        verify(challengeRepository, times(1)).delete(mockChallenge);
        verify(activityLogService, times(1)).logActivity(isNull(), eq(com.fitpulse.model.enums.ActivityType.CHALLENGE_DELETED), anyString(), eq("CHALLENGE"), eq(10L));
    }

    @Test
    @DisplayName("Admin: Monitor Challenge calculates real participant statistics and roster")
    void testMonitorChallenge_AdminMetrics() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(mockChallenge));

        User user2 = new User("David Miller", "david@fitpulse.com", "hash", Role.USER, "avatar2.png");
        user2.setId(2L);

        UserChallenge uc1 = new UserChallenge(mockUser, mockChallenge);
        uc1.setId(101L);
        uc1.setCurrentProgress(5000);
        uc1.setStatus(ChallengeStatus.COMPLETED);
        uc1.setCompletedAt(LocalDateTime.now());

        UserChallenge uc2 = new UserChallenge(user2, mockChallenge);
        uc2.setId(102L);
        uc2.setCurrentProgress(2500);
        uc2.setStatus(ChallengeStatus.IN_PROGRESS);

        when(userChallengeRepository.findByChallenge(mockChallenge)).thenReturn(Arrays.asList(uc1, uc2));

        ChallengeMonitorResponse monitor = challengeService.monitorChallenge(10L);

        assertNotNull(monitor);
        assertEquals(2, monitor.getTotalParticipants());
        assertEquals(1, monitor.getCompletedCount());
        assertEquals(1, monitor.getInProgressCount());
        assertEquals(50.0, monitor.getCompletionRate());
        assertEquals(2, monitor.getParticipants().size());
        assertEquals(100, monitor.getParticipants().get(0).getProgressPercentage());
        assertEquals(50, monitor.getParticipants().get(1).getProgressPercentage());
    }

    @Test
    @DisplayName("User: Join Challenge enrolls athlete successfully")
    void testJoinChallenge_Success() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(mockChallenge));
        when(userChallengeRepository.findByUserAndChallenge(mockUser, mockChallenge)).thenReturn(Optional.empty());

        when(userChallengeRepository.save(any(UserChallenge.class))).thenAnswer(inv -> {
            UserChallenge uc = inv.getArgument(0);
            uc.setId(99L);
            return uc;
        });

        UserChallengeResponse response = challengeService.joinChallenge(mockUser, 10L);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        assertEquals(ChallengeStatus.IN_PROGRESS, response.getStatus());
        assertEquals(0, response.getCurrentProgress());
        verify(userChallengeRepository, times(1)).save(any(UserChallenge.class));
        verify(activityLogService, times(1)).logActivity(eq(mockUser), eq(com.fitpulse.model.enums.ActivityType.CHALLENGE_ENROLLED), anyString(), eq("CHALLENGE"), eq(10L));
    }

    @Test
    @DisplayName("User: Join Challenge prevents duplicate participation with BadRequestException")
    void testJoinChallenge_PreventsDuplicateEnrollment() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(mockChallenge));

        UserChallenge existing = new UserChallenge(mockUser, mockChallenge);
        when(userChallengeRepository.findByUserAndChallenge(mockUser, mockChallenge)).thenReturn(Optional.of(existing));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> challengeService.joinChallenge(mockUser, 10L));
        assertTrue(ex.getMessage().contains("already enrolled"));
        verify(userChallengeRepository, never()).save(any());
    }

    @Test
    @DisplayName("User: Workout increments challenge progress and completes when threshold met")
    void testProcessWorkoutForChallenges_CompletesAndAwardsXp() {
        UserChallenge uc = new UserChallenge(mockUser, mockChallenge);
        uc.setCurrentProgress(4600); // 400 needed
        uc.setStatus(ChallengeStatus.IN_PROGRESS);

        when(userChallengeRepository.findByUserAndStatus(mockUser, ChallengeStatus.IN_PROGRESS))
                .thenReturn(Collections.singletonList(uc));

        WorkoutLog workout = new WorkoutLog(mockUser, WorkoutType.HIIT, 45, Intensity.HIGH, 500, LocalDateTime.now(), "HIIT Session");

        challengeService.processWorkoutForChallenges(mockUser, workout);

        assertEquals(5100, uc.getCurrentProgress());
        assertEquals(ChallengeStatus.COMPLETED, uc.getStatus());
        assertNotNull(uc.getCompletedAt());
        verify(userRepository, times(1)).save(mockUser);
        verify(activityLogService, times(1)).logActivity(eq(mockUser), eq(com.fitpulse.model.enums.ActivityType.CHALLENGE_COMPLETED), anyString(), eq("CHALLENGE"), eq(10L));
    }

    @Test
    @DisplayName("User: Challenge History maintains complete record of enrolled challenges")
    void testGetUserChallengeHistory_ReturnsAllEnrollments() {
        UserChallenge uc1 = new UserChallenge(mockUser, mockChallenge);
        uc1.setId(1L);
        uc1.setStatus(ChallengeStatus.COMPLETED);

        when(userChallengeRepository.findByUser(mockUser)).thenReturn(Collections.singletonList(uc1));

        List<UserChallengeResponse> history = challengeService.getUserChallengeHistory(mockUser);

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals(ChallengeStatus.COMPLETED, history.get(0).getStatus());
        assertTrue(history.get(0).getChallenge().isJoined());
    }
}
