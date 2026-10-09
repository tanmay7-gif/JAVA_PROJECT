package com.fitpulse.service.jdbc;

import com.fitpulse.jdbc.UserJdbcDao;
import com.fitpulse.jdbc.WorkoutJdbcDao;
import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.strategy.CalorieStrategyFactory;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Concrete implementation of IWorkoutJdbcService.
 * Connects the WorkoutServlet with WorkoutJdbcDao and UserJdbcDao.
 * Flow: Request → Servlet → WorkoutJdbcService → WorkoutJdbcDao → Database.
 */
@Service
public class WorkoutJdbcService implements IWorkoutJdbcService {

    private final WorkoutJdbcDao workoutJdbcDao;
    private final UserJdbcDao userJdbcDao;
    private final CalorieStrategyFactory calorieStrategyFactory;

    public WorkoutJdbcService(WorkoutJdbcDao workoutJdbcDao,
                              UserJdbcDao userJdbcDao,
                              CalorieStrategyFactory calorieStrategyFactory) {
        this.workoutJdbcDao = workoutJdbcDao;
        this.userJdbcDao = userJdbcDao;
        this.calorieStrategyFactory = calorieStrategyFactory;
    }

    @Override
    public Optional<WorkoutLog> getWorkoutById(Long id) throws SQLException {
        return workoutJdbcDao.findById(id);
    }

    @Override
    public List<WorkoutLog> getWorkoutsByUserId(Long userId) throws SQLException {
        return workoutJdbcDao.findByUserId(userId);
    }

    @Override
    public List<WorkoutLog> getAllWorkouts(int limit, int offset) throws SQLException {
        return workoutJdbcDao.findAll(limit, offset);
    }

    @Override
    public WorkoutLog logWorkoutSession(Long userId,
                                         WorkoutType workoutType,
                                         int durationMinutes,
                                         Intensity intensity,
                                         Integer caloriesBurned,
                                         Double volumeKg,
                                         String notes,
                                         int xpAward) throws SQLException {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required to log a workout");
        }
        if (durationMinutes <= 0) {
            throw new IllegalArgumentException("Workout duration must be greater than 0 minutes");
        }

        Optional<User> userOpt = userJdbcDao.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Athlete not found with ID: " + userId);
        }

        Intensity safeIntensity = intensity != null ? intensity : Intensity.MEDIUM;
        WorkoutType safeType = workoutType != null ? workoutType : WorkoutType.OTHER;

        int finalCalories = (caloriesBurned != null && caloriesBurned > 0)
                ? caloriesBurned
                : calorieStrategyFactory.estimateCalories(safeType, safeIntensity, durationMinutes, 70.0);

        Double finalVolume = volumeKg != null ? volumeKg : 0.0;

        WorkoutLog workout = new WorkoutLog(
                userOpt.get(),
                safeType,
                durationMinutes,
                safeIntensity,
                finalCalories,
                finalVolume,
                LocalDateTime.now(),
                notes
        );

        // Executes multi-table ACID transaction: inserts workout and awards XP atomically
        return workoutJdbcDao.createWorkoutWithXpTransaction(workout, xpAward);
    }

    @Override
    public boolean updateWorkout(Long workoutId, Map<String, Object> updates) throws SQLException {
        Optional<WorkoutLog> logOpt = workoutJdbcDao.findById(workoutId);
        if (logOpt.isEmpty()) {
            return false;
        }

        WorkoutLog existing = logOpt.get();

        if (updates.containsKey("durationMinutes")) {
            Number d = (Number) updates.get("durationMinutes");
            if (d != null) existing.setDurationMinutes(d.intValue());
        }
        if (updates.containsKey("caloriesBurned")) {
            Number c = (Number) updates.get("caloriesBurned");
            if (c != null) existing.setCaloriesBurned(c.intValue());
        }
        if (updates.containsKey("volumeKg")) {
            Number v = (Number) updates.get("volumeKg");
            if (v != null) existing.setVolumeKg(v.doubleValue());
        }
        if (updates.containsKey("notes")) {
            existing.setNotes((String) updates.get("notes"));
        }
        if (updates.containsKey("intensity")) {
            try {
                existing.setIntensity(Intensity.valueOf(((String) updates.get("intensity")).trim().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (updates.containsKey("workoutType")) {
            try {
                existing.setWorkoutType(WorkoutType.valueOf(((String) updates.get("workoutType")).trim().toUpperCase()));
            } catch (Exception ignored) {}
        }

        return workoutJdbcDao.update(existing);
    }

    @Override
    public boolean deleteWorkout(Long workoutId) throws SQLException {
        return workoutJdbcDao.delete(workoutId);
    }
}
