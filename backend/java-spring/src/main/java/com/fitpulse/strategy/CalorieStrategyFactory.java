package com.fitpulse.strategy;

import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Factory and Registry for polymorphic calorie calculation strategies.
 * Demonstrates:
 * - OOP Polymorphism: Dispatches calculations to polymorphic strategy implementations.
 * - Collections: Uses EnumMap and List for strategy lookup.
 * - Inversion of Control: Injects all Spring-managed strategy beans automatically.
 */
@Component
public class CalorieStrategyFactory {

    private final Map<WorkoutType, CalorieCalculationStrategy> strategyMap;
    private final CalorieCalculationStrategy defaultStrategy;

    public CalorieStrategyFactory(List<CalorieCalculationStrategy> strategies,
                                  DefaultCalorieStrategy defaultStrategy) {
        this.strategyMap = new EnumMap<>(WorkoutType.class);
        this.defaultStrategy = defaultStrategy;

        for (CalorieCalculationStrategy strategy : strategies) {
            if (strategy.getSupportedWorkoutType() != null) {
                this.strategyMap.put(strategy.getSupportedWorkoutType(), strategy);
            }
        }
    }

    /**
     * Resolves the polymorphic strategy for a given workout modality.
     *
     * @param type the workout modality
     * @return matching CalorieCalculationStrategy or default fallback
     */
    public CalorieCalculationStrategy getStrategy(WorkoutType type) {
        if (type == null) {
            return defaultStrategy;
        }
        return strategyMap.getOrDefault(type, defaultStrategy);
    }

    /**
     * Convenience polymorphic evaluation method.
     */
    public int estimateCalories(WorkoutType type, Intensity intensity, int durationMinutes, double weightKg) {
        CalorieCalculationStrategy strategy = getStrategy(type);
        return strategy.calculateCalories(intensity, durationMinutes, weightKg);
    }
}
