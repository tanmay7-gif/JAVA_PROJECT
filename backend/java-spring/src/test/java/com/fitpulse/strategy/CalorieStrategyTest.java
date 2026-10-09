package com.fitpulse.strategy;

import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class CalorieStrategyTest {

    @Test
    void testStrengthCalorieStrategy() {
        StrengthCalorieStrategy strategy = new StrengthCalorieStrategy();
        assertEquals(WorkoutType.STRENGTH, strategy.getSupportedWorkoutType());

        // 60 mins of high intensity strength training for a 70kg athlete
        int calories = strategy.calculateCalories(Intensity.HIGH, 60, 70.0);
        assertTrue(calories > 400 && calories < 800, "Strength calories should be physiologically valid: " + calories);
    }

    @Test
    void testHiitCalorieStrategy_HigherThanYoga() {
        HiitCalorieStrategy hiit = new HiitCalorieStrategy();
        YogaCalorieStrategy yoga = new YogaCalorieStrategy();

        int hiitCal = hiit.calculateCalories(Intensity.HIGH, 45, 75.0);
        int yogaCal = yoga.calculateCalories(Intensity.LOW, 45, 75.0);

        assertTrue(hiitCal > yogaCal * 2, "HIIT must burn significantly more calories than Yoga: " + hiitCal + " vs " + yogaCal);
    }

    @Test
    void testCalorieStrategyFactory_PolymorphicResolution() {
        DefaultCalorieStrategy defaultStrategy = new DefaultCalorieStrategy();
        StrengthCalorieStrategy strength = new StrengthCalorieStrategy();
        CardioCalorieStrategy cardio = new CardioCalorieStrategy();

        CalorieStrategyFactory factory = new CalorieStrategyFactory(
                Arrays.asList(strength, cardio, defaultStrategy),
                defaultStrategy
        );

        CalorieCalculationStrategy resolvedStrength = factory.getStrategy(WorkoutType.STRENGTH);
        assertEquals(WorkoutType.STRENGTH, resolvedStrength.getSupportedWorkoutType());

        CalorieCalculationStrategy fallback = factory.getStrategy(WorkoutType.PILATES);
        assertNotNull(fallback);
    }
}
