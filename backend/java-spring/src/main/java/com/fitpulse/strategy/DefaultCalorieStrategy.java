package com.fitpulse.strategy;

import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

/**
 * Fallback default strategy for generalized exercise modalities.
 * Demonstrates OOP Polymorphism and Inheritance.
 */
@Component
public class DefaultCalorieStrategy extends AbstractCalorieStrategy {

    public DefaultCalorieStrategy() {
        super(WorkoutType.PILATES, 5.0);
    }

    @Override
    protected double getModalityCoefficient() {
        return 1.0;
    }
}
