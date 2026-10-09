package com.fitpulse.model.enums;

/**
 * Enumeration representing measurable fitness goal types in FitPulse.
 */
public enum GoalType {
    CALORIE_BURN("Calories Burned Target", "kcal"),
    WORKOUT_COUNT("Total Workouts Target", "sessions"),
    DURATION_MINUTES("Active Duration Target", "minutes"),
    WEIGHT_TARGET("Target Body Mass", "kg"),
    VOLUME_KG("Total Volume Lifted Target", "kg");

    private final String displayName;
    private final String unit;

    GoalType(String displayName, String unit) {
        this.displayName = displayName;
        this.unit = unit;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getUnit() {
        return unit;
    }
}
