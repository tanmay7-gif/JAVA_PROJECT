package com.fitpulse.service.jdbc;

import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service interface for Workout operations executed through the JDBC layer.
 * Enforces the architectural flow: Request → Servlet → Service → JDBC Repository → Database.
 */
public interface IWorkoutJdbcService {

    Optional<WorkoutLog> getWorkoutById(Long id) throws SQLException;

    List<WorkoutLog> getWorkoutsByUserId(Long userId) throws SQLException;

    List<WorkoutLog> getAllWorkouts(int limit, int offset) throws SQLException;

    WorkoutLog logWorkoutSession(Long userId,
                                 WorkoutType workoutType,
                                 int durationMinutes,
                                 Intensity intensity,
                                 Integer caloriesBurned,
                                 Double volumeKg,
                                 String notes,
                                 int xpAward) throws SQLException;

    boolean updateWorkout(Long workoutId, Map<String, Object> updates) throws SQLException;

    boolean deleteWorkout(Long workoutId) throws SQLException;
}
