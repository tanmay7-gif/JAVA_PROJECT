package com.fitpulse.service;

import com.fitpulse.dto.GoalDtos.GoalCreateRequest;
import com.fitpulse.dto.GoalDtos.GoalResponse;
import com.fitpulse.model.Goal;
import com.fitpulse.model.User;
import com.fitpulse.model.Workout;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.model.enums.GoalType;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.Role;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.repository.GoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private IAuthService authService;

    @Mock
    private IActivityLogService activityLogService;

    @InjectMocks
    private GoalServiceImpl goalService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User("Sarah Connor", "sarah@fitpulse.com", "hash", Role.USER, "avatar.png");
        mockUser.setId(1L);
    }

    @Test
    void testCreateGoal_Success() {
        GoalCreateRequest request = new GoalCreateRequest();
        request.setTitle("Burn 5,000 Calories");
        request.setGoalType(GoalType.CALORIE_BURN);
        request.setTargetValue(5000.0);
        request.setTargetDate(LocalDateTime.now().plusDays(30));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> {
            Goal goal = invocation.getArgument(0);
            goal.setId(10L);
            return goal;
        });

        GoalResponse response = goalService.createGoal(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Burn 5,000 Calories", response.getTitle());
        assertEquals(GoalType.CALORIE_BURN, response.getGoalType());
        assertEquals(5000.0, response.getTargetValue());
        assertEquals(0.0, response.getCurrentValue());
        assertEquals(GoalStatus.IN_PROGRESS, response.getStatus());

        verify(goalRepository, times(1)).save(any(Goal.class));
    }

    @Test
    void testEvaluateGoalsAfterWorkout_IncrementsProgress() {
        Goal activeGoal = new Goal(mockUser, "Burn 10,000 Calories", "Monthly Burn",
                GoalType.CALORIE_BURN, 10000.0, LocalDateTime.now().plusDays(20));
        activeGoal.setCurrentValue(2000.0);

        when(goalRepository.findByUserAndStatus(mockUser, GoalStatus.IN_PROGRESS))
                .thenReturn(Collections.singletonList(activeGoal));

        Workout workout = new Workout(mockUser, WorkoutType.STRENGTH, 60, Intensity.HIGH, 600, LocalDateTime.now(), "Chest day");

        goalService.evaluateGoalsAfterWorkout(mockUser, workout);

        assertEquals(2600.0, activeGoal.getCurrentValue());
        verify(goalRepository, times(1)).save(activeGoal);
    }

    @Test
    void testUpdateGoal_Success() {
        Goal existing = new Goal(mockUser, "Cardio Sprint", "Weekly running",
                GoalType.DURATION_MINUTES, 120.0, LocalDateTime.now().plusDays(7));
        existing.setId(5L);
        existing.setCurrentValue(40.0);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(goalRepository.findById(5L)).thenReturn(java.util.Optional.of(existing));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        com.fitpulse.dto.GoalDtos.GoalUpdateRequest updateReq = new com.fitpulse.dto.GoalDtos.GoalUpdateRequest();
        updateReq.setTitle("Updated Cardio Sprint");
        updateReq.setDescription("Updated desc");
        updateReq.setGoalType(GoalType.DURATION_MINUTES);
        updateReq.setTargetValue(150.0);
        updateReq.setCurrentValue(75.0);
        updateReq.setTargetDate(LocalDateTime.now().plusDays(10));
        updateReq.setStatus(GoalStatus.IN_PROGRESS);

        GoalResponse resp = goalService.updateGoal(5L, updateReq);

        assertNotNull(resp);
        assertEquals("Updated Cardio Sprint", resp.getTitle());
        assertEquals(150.0, resp.getTargetValue());
        assertEquals(75.0, resp.getCurrentValue());
        assertEquals(50.0, resp.getCompletionPercentage());
        verify(goalRepository, times(1)).save(existing);
        verify(activityLogService, times(1)).logActivity(eq(mockUser), eq(com.fitpulse.model.enums.ActivityType.GOAL_UPDATED), anyString(), eq("GOAL"), eq(5L));
    }

    @Test
    void testUpdateGoal_AutoCompletesWhenTargetReached() {
        Goal existing = new Goal(mockUser, "Step Milestone", "Steps target",
                GoalType.WORKOUT_COUNT, 10.0, LocalDateTime.now().plusDays(5));
        existing.setId(8L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(goalRepository.findById(8L)).thenReturn(java.util.Optional.of(existing));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        com.fitpulse.dto.GoalDtos.GoalUpdateRequest updateReq = new com.fitpulse.dto.GoalDtos.GoalUpdateRequest();
        updateReq.setTitle("Step Milestone");
        updateReq.setGoalType(GoalType.WORKOUT_COUNT);
        updateReq.setTargetValue(10.0);
        updateReq.setCurrentValue(10.0); // Reached target!

        GoalResponse resp = goalService.updateGoal(8L, updateReq);

        assertNotNull(resp);
        assertEquals(GoalStatus.COMPLETED, resp.getStatus());
        assertEquals(100.0, resp.getCompletionPercentage());
        verify(activityLogService, times(1)).logActivity(eq(mockUser), eq(com.fitpulse.model.enums.ActivityType.GOAL_COMPLETED), anyString(), eq("GOAL"), eq(8L));
    }

    @Test
    void testDeleteGoal_Success() {
        Goal existing = new Goal(mockUser, "Delete Me", "To be removed",
                GoalType.CALORIE_BURN, 500.0, LocalDateTime.now().plusDays(2));
        existing.setId(9L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(goalRepository.findById(9L)).thenReturn(java.util.Optional.of(existing));

        goalService.deleteGoal(9L);

        verify(goalRepository, times(1)).delete(existing);
        verify(activityLogService, times(1)).logActivity(eq(mockUser), eq(com.fitpulse.model.enums.ActivityType.GOAL_DELETED), anyString(), eq("GOAL"), eq(9L));
    }

    @Test
    void testUpdateGoal_AccessDeniedForDifferentUser() {
        User otherUser = new User("David Miller", "david@fitpulse.com", "hash", Role.USER, "avatar.png");
        otherUser.setId(2L);

        Goal otherGoal = new Goal(otherUser, "David's Goal", "Private",
                GoalType.CALORIE_BURN, 500.0, LocalDateTime.now().plusDays(2));
        otherGoal.setId(15L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(goalRepository.findById(15L)).thenReturn(java.util.Optional.of(otherGoal));

        com.fitpulse.dto.GoalDtos.GoalUpdateRequest updateReq = new com.fitpulse.dto.GoalDtos.GoalUpdateRequest();
        updateReq.setTitle("Hacked Goal");
        updateReq.setGoalType(GoalType.CALORIE_BURN);
        updateReq.setTargetValue(100.0);

        assertThrows(com.fitpulse.exception.BadRequestException.class, () -> goalService.updateGoal(15L, updateReq));
        verify(goalRepository, never()).save(any());
    }
}
