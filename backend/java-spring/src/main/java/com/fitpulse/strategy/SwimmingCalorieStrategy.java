package com.fitpulse.strategy;

import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

/**
 * Concrete strategy for Full-Body Aquatic Conditioning.
 * Demonstrates OOP Polymorphism and Inheritance.
 */
@Component
public class SwimmingCalorieStrategy extends AbstractCalorieStrategy {

    public SwimmingCalorieStrategy() {
        super(WorkoutType.SWIMMING, 7.0);
    }

    @Override
    protected double getModalityCoefficient() {
        return 1.1;
    }
}
