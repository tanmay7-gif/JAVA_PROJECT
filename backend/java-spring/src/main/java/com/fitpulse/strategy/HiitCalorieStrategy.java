package com.fitpulse.strategy;

import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

/**
 * Concrete strategy for High-Intensity Interval Training (HIIT).
 * Accounts for excess post-exercise oxygen consumption (EPOC).
 * Demonstrates OOP Polymorphism and Inheritance.
 */
@Component
public class HiitCalorieStrategy extends AbstractCalorieStrategy {

    public HiitCalorieStrategy() {
        super(WorkoutType.HIIT, 10.0);
    }

    @Override
    protected double getModalityCoefficient() {
        // EPOC metabolic boost factor
        return 1.15;
    }
}
