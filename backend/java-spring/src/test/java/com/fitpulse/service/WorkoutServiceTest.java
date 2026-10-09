package com.fitpulse.service;

import com.fitpulse.dto.WorkoutDtos.WorkoutCreateRequest;
import com.fitpulse.dto.WorkoutDtos.WorkoutResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutUpdateRequest;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.User;
import com.fitpulse.model.Workout;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.Role;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.repository.WorkoutLogRepository;
import com.fitpulse.strategy.CalorieStrategyFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkoutServiceTest {

    @Mock
    private WorkoutLogRepository workoutLogRepository;

    @Mock
    private IAuthService authService;

    @Mock
    private ChallengeService challengeService;

    @Mock
    private IGoalService goalService;

    @Mock
    private IActivityLogService activityLogService;

    @Mock
    private CalorieStrategyFactory calorieStrategyFactory;

    @InjectMocks
    private WorkoutService workoutService;

    private User mockUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        mockUser = new User("Sarah Connor", "sarah@fitpulse.com", "hash", Role.USER, "avatar.png");
        mockUser.setId(1L);

        otherUser = new User("John Connor", "john@fitpulse.com", "hash", Role.USER, "avatar.png");
        otherUser.setId(2L);
    }

    @Test
    @DisplayName("Create: logWorkout saves record, evaluates goals & challenges, and records audit log")
    void testLogWorkout_Success() {
        WorkoutCreateRequest request = new WorkoutCreateRequest();
        request.setWorkoutType(WorkoutType.STRENGTH);
        request.setDurationMinutes(60);
        request.setIntensity(Intensity.HIGH);
        request.setCaloriesBurned(550);
        request.setVolumeKg(1200.0);
        request.setNotes("Heavy Leg Day");

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.save(any(WorkoutLog.class))).thenAnswer(invocation -> {
            WorkoutLog log = invocation.getArgument(0);
            log.setId(100L);
            return log;
        });

        WorkoutResponse response = workoutService.logWorkout(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(WorkoutType.STRENGTH, response.getType());
        assertEquals(60, response.getDurationMinutes());
        assertEquals(550, response.getCaloriesBurned());
        assertEquals(1200.0, response.getVolumeKg());

        // Verify progression and audit callbacks
        verify(challengeService, times(1)).processWorkoutForChallenges(eq(mockUser), any(WorkoutLog.class));
        verify(goalService, times(1)).evaluateGoalsAfterWorkout(eq(mockUser), any(Workout.class));
        verify(workoutLogRepository, times(1)).save(any(WorkoutLog.class));
    }

    @Test
    @DisplayName("Read: getWorkoutById returns session when owned by requesting user")
    void testGetWorkoutById_Success() {
        WorkoutLog existing = new WorkoutLog(mockUser, WorkoutType.CARDIO, 45, Intensity.MEDIUM, 400, 0.0, LocalDateTime.now(), "Zone 2");
        existing.setId(200L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.findById(200L)).thenReturn(Optional.of(existing));

        WorkoutResponse response = workoutService.getWorkoutById(200L);

        assertNotNull(response);
        assertEquals(200L, response.getId());
        assertEquals(WorkoutType.CARDIO, response.getType());
    }

    @Test
    @DisplayName("Read: getWorkoutById throws BadRequestException when accessing another user's workout")
    void testGetWorkoutById_UnauthorizedAccess() {
        WorkoutLog existing = new WorkoutLog(otherUser, WorkoutType.CARDIO, 45, Intensity.MEDIUM, 400, 0.0, LocalDateTime.now(), "Zone 2");
        existing.setId(200L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.findById(200L)).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> workoutService.getWorkoutById(200L));
    }

    @Test
    @DisplayName("Update: updateWorkout modifies fields and saves updated workout")
    void testUpdateWorkout_Success() {
        WorkoutLog existing = new WorkoutLog(mockUser, WorkoutType.STRENGTH, 45, Intensity.MEDIUM, 350, 800.0, LocalDateTime.now(), "Original notes");
        existing.setId(300L);

        WorkoutUpdateRequest updateReq = new WorkoutUpdateRequest();
        updateReq.setDurationMinutes(55);
        updateReq.setVolumeKg(1050.0);
        updateReq.setNotes("Updated PR leg press");

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.findById(300L)).thenReturn(Optional.of(existing));
        when(workoutLogRepository.save(any(WorkoutLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutResponse response = workoutService.updateWorkout(300L, updateReq);

        assertNotNull(response);
        assertEquals(55, response.getDurationMinutes());
        assertEquals(1050.0, response.getVolumeKg());
        assertEquals("Updated PR leg press", response.getNotes());
        verify(workoutLogRepository).save(existing);
    }

    @Test
    @DisplayName("Update: updateWorkout throws BadRequestException when unauthorized user attempts edit")
    void testUpdateWorkout_Unauthorized() {
        WorkoutLog existing = new WorkoutLog(otherUser, WorkoutType.STRENGTH, 45, Intensity.MEDIUM, 350, 800.0, LocalDateTime.now(), "Original");
        existing.setId(300L);

        WorkoutUpdateRequest updateReq = new WorkoutUpdateRequest();
        updateReq.setDurationMinutes(60);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.findById(300L)).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> workoutService.updateWorkout(300L, updateReq));
        verify(workoutLogRepository, never()).save(any(WorkoutLog.class));
    }

    @Test
    @DisplayName("Delete: deleteWorkout removes session when owned by user")
    void testDeleteWorkout_Success() {
        WorkoutLog existing = new WorkoutLog(mockUser, WorkoutType.HIIT, 30, Intensity.HIGH, 350, 0.0, LocalDateTime.now(), "Tabata");
        existing.setId(400L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.findById(400L)).thenReturn(Optional.of(existing));

        workoutService.deleteWorkout(400L);

        verify(workoutLogRepository).delete(existing);
    }

    @Test
    @DisplayName("Delete: deleteWorkout throws BadRequestException if another user attempts deletion")
    void testDeleteWorkout_Unauthorized() {
        WorkoutLog existing = new WorkoutLog(otherUser, WorkoutType.HIIT, 30, Intensity.HIGH, 350, 0.0, LocalDateTime.now(), "Tabata");
        existing.setId(400L);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(mockUser);
        when(workoutLogRepository.findById(400L)).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> workoutService.deleteWorkout(400L));
        verify(workoutLogRepository, never()).delete(any(WorkoutLog.class));
    }
}
