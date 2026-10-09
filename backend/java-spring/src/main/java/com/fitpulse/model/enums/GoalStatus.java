package com.fitpulse.model.enums;

/**
 * Enumeration representing the lifecycle state of a fitness goal.
 */
public enum GoalStatus {
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    ABANDONED("Abandoned");

    private final String displayName;

    GoalStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == ABANDONED;
    }
}
