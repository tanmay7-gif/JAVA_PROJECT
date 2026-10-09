package com.fitpulse.repository;

import com.fitpulse.model.User;
import com.fitpulse.model.Workout;
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
 * Data access repository for core Workout domain entities.
 * Demonstrates Repository Pattern and Generic BaseRepository extension.
 */
@Repository
public interface WorkoutRepository extends BaseRepository<Workout, Long> {

    Page<Workout> findByUserOrderByLoggedAtDesc(User user, Pageable pageable);

    Page<Workout> findByUserAndWorkoutTypeOrderByLoggedAtDesc(User user, WorkoutType workoutType, Pageable pageable);

    List<Workout> findByUserAndLoggedAtBetweenOrderByLoggedAtAsc(User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(w) FROM Workout w WHERE w.loggedAt >= :startOfDay")
    long countWorkoutsToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(w.caloriesBurned), 0) FROM Workout w WHERE w.user = :user AND w.loggedAt >= :since")
    int sumCaloriesSince(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(w.durationMinutes), 0) FROM Workout w WHERE w.user = :user AND w.loggedAt >= :since")
    int sumDurationSince(@Param("user") User user, @Param("since") LocalDateTime since);

    long countByUser(User user);
}
