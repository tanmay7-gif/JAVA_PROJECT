package com.fitpulse.model.enums;

/**
 * Enumeration representing domain activity and audit log events in FitPulse.
 */
public enum ActivityType {
    USER_REGISTERED("User Registration"),
    USER_LOGIN("User Authentication"),
    PROFILE_UPDATED("Profile Modified"),
    ROLE_UPDATED("Role Permission Changed"),
    USER_STATUS_TOGGLED("Account Status Changed"),
    WORKOUT_LOGGED("Workout Logged"),
    WORKOUT_UPDATED("Workout Session Updated"),
    WORKOUT_DELETED("Workout Deleted"),
    USER_DELETED("User Account Deactivated"),
    GOAL_CREATED("Fitness Goal Created"),
    GOAL_UPDATED("Fitness Goal Updated"),
    GOAL_PROGRESS_UPDATED("Goal Progress Incremented"),
    GOAL_COMPLETED("Goal Successfully Achieved"),
    GOAL_DELETED("Fitness Goal Deleted"),
    CHALLENGE_CREATED("Fitness Challenge Created"),
    CHALLENGE_UPDATED("Fitness Challenge Updated"),
    CHALLENGE_DELETED("Fitness Challenge Deleted"),
    CHALLENGE_ENROLLED("Challenge Enrolled"),
    CHALLENGE_PROGRESS_UPDATED("Challenge Progress Incremented"),
    CHALLENGE_COMPLETED("Challenge Completed & Reward Claimed"),
    CONTENT_CREATED("Fitness Content Authored"),
    CONTENT_UPDATED("Fitness Content Updated"),
    CONTENT_DELETED("Fitness Content Archived"),
    SYSTEM_SETTING_UPDATED("System Configuration Changed");

    private final String description;

    ActivityType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
