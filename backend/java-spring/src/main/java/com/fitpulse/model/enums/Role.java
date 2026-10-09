package com.fitpulse.model.enums;

/**
 * Enumeration representing user security authorization roles in FitPulse.
 * Demonstrates rich Java Enum with encapsulated state and helper methods.
 */
public enum Role {
    USER("Athlete", "ROLE_USER"),
    ADMIN("Administrator", "ROLE_ADMIN"),
    COACH("Coach / Specialist", "ROLE_COACH");

    private final String displayName;
    private final String authority;

    Role(String displayName, String authority) {
        this.displayName = displayName;
        this.authority = authority;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAuthority() {
        return authority;
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }
}
