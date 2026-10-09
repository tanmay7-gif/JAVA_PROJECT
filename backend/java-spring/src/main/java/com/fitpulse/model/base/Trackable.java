package com.fitpulse.model.base;

/**
 * Interface representing quantifiable domain entities supporting progress metrics.
 */
public interface Trackable {
    Double getCompletionPercentage();
    boolean isCompleted();
}
