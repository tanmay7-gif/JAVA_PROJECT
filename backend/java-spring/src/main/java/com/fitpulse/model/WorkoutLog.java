package com.fitpulse.model;

import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.time.LocalDateTime;

/**
 * Specialized WorkoutLog entity extending Workout.
 * Demonstrates OOP Inheritance and Polymorphic Subtyping.
 */
@Entity
@DiscriminatorValue("LOG")
public class WorkoutLog extends Workout {

    public WorkoutLog() {
        super();
    }

    public WorkoutLog(User user, WorkoutType workoutType, Integer durationMinutes,
                      Intensity intensity, Integer caloriesBurned, LocalDateTime loggedAt, String notes) {
        super(user, workoutType, durationMinutes, intensity, caloriesBurned, loggedAt, notes);
    }

    public WorkoutLog(User user, WorkoutType workoutType, Integer durationMinutes,
                      Intensity intensity, Integer caloriesBurned, Double volumeKg, LocalDateTime loggedAt, String notes) {
        super(user, workoutType, durationMinutes, intensity, caloriesBurned, volumeKg, loggedAt, notes);
    }
}
