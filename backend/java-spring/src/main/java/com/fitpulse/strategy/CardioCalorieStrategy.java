package com.fitpulse.strategy;

import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

/**
 * Concrete strategy for Steady-State Cardiovascular conditioning.
 * Demonstrates OOP Polymorphism and Inheritance.
 */
@Component
public class CardioCalorieStrategy extends AbstractCalorieStrategy {

    public CardioCalorieStrategy() {
        super(WorkoutType.CARDIO, 8.0);
    }

    @Override
    protected double getModalityCoefficient() {
        return 1.0;
    }
}
