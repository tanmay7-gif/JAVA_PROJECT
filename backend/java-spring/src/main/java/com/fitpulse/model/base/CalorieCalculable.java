package com.fitpulse.model.base;

/**
 * Interface representing physical activity entities capable of reporting or computing calorie expenditure.
 */
public interface CalorieCalculable {
    Integer getCaloriesBurned();
    Integer getDurationMinutes();
}
