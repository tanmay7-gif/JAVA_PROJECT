package com.fitpulse.model.enums;

/**
 * Enumeration representing athletic exercise modalities and physiological MET coefficients.
 * Demonstrates rich Java Enum with base metabolic values and categorizations.
 */
public enum WorkoutType {
    CARDIO(8.0, "Cardiovascular Conditioning"),
    STRENGTH(6.0, "Resistance & Hypertrophy Training"),
    HIIT(10.0, "High-Intensity Interval Training"),
    YOGA(3.0, "Mindfulness, Mobility & Vinyasa"),
    CYCLING(8.5, "Stationary & Road Cycling"),
    RUNNING(9.8, "Endurance & Sprint Running"),
    SWIMMING(7.0, "Full-Body Aquatic Conditioning"),
    PILATES(3.5, "Core Stability & Calisthenic Control");

    private final double baseMet;
    private final String displayName;

    WorkoutType(double baseMet, String displayName) {
        this.baseMet = baseMet;
        this.displayName = displayName;
    }

    public double getBaseMet() {
        return baseMet;
    }

    public String getDisplayName() {
        return displayName;
    }
}
