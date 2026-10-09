package com.fitpulse.strategy;

import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;

/**
 * Abstract foundational calorie calculation strategy providing standard physiological MET math.
 * Demonstrates OOP Abstraction and Inheritance.
 *
 * Formula: Calories = ((MET * 3.5 * weightKg) / 200) * durationMinutes * intensityFactor
 */
public abstract class AbstractCalorieStrategy implements CalorieCalculationStrategy {

    private final WorkoutType workoutType;
    private final double baseMet;

    public AbstractCalorieStrategy(WorkoutType workoutType, double baseMet) {
        this.workoutType = workoutType;
        this.baseMet = baseMet;
    }

    @Override
    public WorkoutType getSupportedWorkoutType() {
        return workoutType;
    }

    public double getBaseMet() {
        return baseMet;
    }

    @Override
    public int calculateCalories(Intensity intensity, int durationMinutes, double weightKg) {
        if (durationMinutes <= 0) return 0;
        double effectiveWeight = weightKg > 0 ? weightKg : 70.0; // Default standard 70kg athlete
        double intensityFactor = intensity != null ? intensity.getMultiplier() : 1.0;

        // Scientific MET equation
        double caloriesPerMinute = (baseMet * 3.5 * effectiveWeight) / 200.0;
        double totalCalories = caloriesPerMinute * durationMinutes * intensityFactor * getModalityCoefficient();

        return (int) Math.round(Math.max(1.0, totalCalories));
    }

    /**
     * Hook method allowing specialized subclasses to apply sport-specific metabolic factors.
     * Demonstrates the Template Method design pattern.
     */
    protected double getModalityCoefficient() {
        return 1.0;
    }
}
