package com.fitpulse.repository;

import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data access repository for WorkoutLog entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface WorkoutLogRepository extends BaseRepository<WorkoutLog, Long> {

    Page<WorkoutLog> findByUserOrderByLoggedAtDesc(User user, Pageable pageable);

    Page<WorkoutLog> findByUserAndWorkoutTypeOrderByLoggedAtDesc(User user, WorkoutType workoutType, Pageable pageable);

    List<WorkoutLog> findByUserAndLoggedAtBetweenOrderByLoggedAtAsc(User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(w) FROM WorkoutLog w WHERE w.loggedAt >= :startOfDay")
    long countWorkoutsToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(w.caloriesBurned), 0) FROM WorkoutLog w WHERE w.user = :user AND w.loggedAt >= :since")
    int sumCaloriesSince(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(w.durationMinutes), 0) FROM WorkoutLog w WHERE w.user = :user AND w.loggedAt >= :since")
    int sumDurationSince(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(w.caloriesBurned), 0) FROM WorkoutLog w WHERE w.user = :user")
    int sumTotalCalories(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(w.durationMinutes), 0) FROM WorkoutLog w WHERE w.user = :user")
    int sumTotalDuration(@Param("user") User user);

    @Query("SELECT COUNT(w) FROM WorkoutLog w WHERE w.user = :user AND w.loggedAt >= :since")
    long countByUserAndLoggedAtSince(@Param("user") User user, @Param("since") LocalDateTime since);

    List<WorkoutLog> findByUser(User user);

    long countByUser(User user);
}
