package com.fitpulse.service.jdbc;

import com.fitpulse.jdbc.UserJdbcDao;
import com.fitpulse.jdbc.WorkoutJdbcDao;
import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.Role;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.strategy.CalorieStrategyFactory;
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
public class WorkoutJdbcServiceTest {

    @Mock
    private WorkoutJdbcDao workoutJdbcDao;

    @Mock
    private UserJdbcDao userJdbcDao;

    @Mock
    private CalorieStrategyFactory calorieStrategyFactory;

    @InjectMocks
    private WorkoutJdbcService workoutJdbcService;

    private User sampleUser;
    private WorkoutLog sampleWorkout;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Jane Smith", "jane@example.com", "hash", Role.USER, null);
        sampleUser.setId(10L);

        sampleWorkout = new WorkoutLog(sampleUser, WorkoutType.STRENGTH, 50, Intensity.HIGH, 400, 2000.0, LocalDateTime.now(), "Chest day");
        sampleWorkout.setId(100L);
    }

    @Test
    @DisplayName("getWorkoutById should delegate to workoutJdbcDao.findById")
    void testGetWorkoutById() throws SQLException {
        when(workoutJdbcDao.findById(100L)).thenReturn(Optional.of(sampleWorkout));

        Optional<WorkoutLog> result = workoutJdbcService.getWorkoutById(100L);

        assertTrue(result.isPresent());
        assertEquals(WorkoutType.STRENGTH, result.get().getWorkoutType());
        verify(workoutJdbcDao).findById(100L);
    }

    @Test
    @DisplayName("getWorkoutsByUserId should delegate to workoutJdbcDao.findByUserId")
    void testGetWorkoutsByUserId() throws SQLException {
        when(workoutJdbcDao.findByUserId(10L)).thenReturn(List.of(sampleWorkout));

        List<WorkoutLog> result = workoutJdbcService.getWorkoutsByUserId(10L);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
        verify(workoutJdbcDao).findByUserId(10L);
    }

    @Test
    @DisplayName("logWorkoutSession should calculate calories via strategy if 0 and invoke atomic transaction")
    void testLogWorkoutSession_CalculatesCaloriesAndCallsTransaction() throws SQLException {
        when(userJdbcDao.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(calorieStrategyFactory.estimateCalories(WorkoutType.HIIT, Intensity.HIGH, 30, 70.0)).thenReturn(350);
        when(workoutJdbcDao.createWorkoutWithXpTransaction(any(WorkoutLog.class), eq(50))).thenAnswer(invocation -> {
            WorkoutLog w = invocation.getArgument(0);
            w.setId(200L);
            return w;
        });

        WorkoutLog logged = workoutJdbcService.logWorkoutSession(
                10L, WorkoutType.HIIT, 30, Intensity.HIGH, 0, 0.0, "High intensity burn", 50
        );

        assertNotNull(logged);
        assertEquals(200L, logged.getId());
        assertEquals(350, logged.getCaloriesBurned());
        verify(calorieStrategyFactory).estimateCalories(WorkoutType.HIIT, Intensity.HIGH, 30, 70.0);
        verify(workoutJdbcDao).createWorkoutWithXpTransaction(any(WorkoutLog.class), eq(50));
    }

    @Test
    @DisplayName("updateWorkout should update telemetry fields and call workoutJdbcDao.update")
    void testUpdateWorkout_Success() throws SQLException {
        when(workoutJdbcDao.findById(100L)).thenReturn(Optional.of(sampleWorkout));
        when(workoutJdbcDao.update(any(WorkoutLog.class))).thenReturn(true);

        boolean updated = workoutJdbcService.updateWorkout(100L, Map.of("durationMinutes", 60, "notes", "Updated chest day"));

        assertTrue(updated);
        assertEquals(60, sampleWorkout.getDurationMinutes());
        assertEquals("Updated chest day", sampleWorkout.getNotes());
        verify(workoutJdbcDao).update(sampleWorkout);
    }

    @Test
    @DisplayName("deleteWorkout should delegate to workoutJdbcDao.delete")
    void testDeleteWorkout() throws SQLException {
        when(workoutJdbcDao.delete(100L)).thenReturn(true);

        boolean deleted = workoutJdbcService.deleteWorkout(100L);

        assertTrue(deleted);
        verify(workoutJdbcDao).delete(100L);
    }
}
