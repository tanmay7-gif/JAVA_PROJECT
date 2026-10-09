package com.fitpulse.strategy;

import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

/**
 * Concrete strategy for Strength, Hypertrophy, and Resistance training.
 * Demonstrates OOP Polymorphism and Inheritance.
 */
@Component
public class StrengthCalorieStrategy extends AbstractCalorieStrategy {

    public StrengthCalorieStrategy() {
        super(WorkoutType.STRENGTH, 6.0);
    }

    @Override
    protected double getModalityCoefficient() {
        // Incorporates post-activation potentiation and anaerobic resistance load factor
        return 1.08;
    }
}
