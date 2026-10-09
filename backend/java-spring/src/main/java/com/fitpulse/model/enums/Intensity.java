package com.fitpulse.model.enums;

/**
 * Enumeration representing workout intensity levels and MET multiplication coefficients.
 * Demonstrates rich Java Enum with encapsulated state and calculation factors.
 */
public enum Intensity {
    LOW(0.8, "Low Intensity (Active Recovery)"),
    MEDIUM(1.0, "Moderate Intensity (Steady State)"),
    HIGH(1.3, "High Intensity (Anaerobic / Peak Exertion)");

    private final double multiplier;
    private final String description;

    Intensity(double multiplier, String description) {
        this.multiplier = multiplier;
        this.description = description;
    }

    public double getMultiplier() {
        return multiplier;
    }

    public String getDescription() {
        return description;
    }
}
