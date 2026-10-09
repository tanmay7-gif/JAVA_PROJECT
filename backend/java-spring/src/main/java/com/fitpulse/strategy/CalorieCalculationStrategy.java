package com.fitpulse.strategy;

import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;

/**
 * Strategy interface for polymorphic calorie expenditure computation.
 * Demonstrates the Strategy Pattern (OOP Abstraction and Polymorphism).
 */
public interface CalorieCalculationStrategy {

    /**
     * Calculates the estimated calories burned for a workout session.
     *
     * @param intensity the workout intensity level
     * @param durationMinutes duration in minutes
     * @param weightKg athlete body mass in kilograms
     * @return estimated calories burned
     */
    int calculateCalories(Intensity intensity, int durationMinutes, double weightKg);

    /**
     * Returns the workout modality handled by this strategy.
     *
     * @return supported WorkoutType
     */
    WorkoutType getSupportedWorkoutType();
}
