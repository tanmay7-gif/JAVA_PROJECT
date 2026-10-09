package com.fitpulse.strategy;

import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

/**
 * Concrete strategy for Yoga, Mobility, and Mindfulness sessions.
 * Demonstrates OOP Polymorphism and Inheritance.
 */
@Component
public class YogaCalorieStrategy extends AbstractCalorieStrategy {

    public YogaCalorieStrategy() {
        super(WorkoutType.YOGA, 3.0);
    }

    @Override
    protected double getModalityCoefficient() {
        return 0.95;
    }
}
