package com.fitpulse.model;

import com.fitpulse.model.enums.TargetMetric;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.time.LocalDateTime;

/**
 * Challenge entity subclassing FitnessChallenge.
 * Demonstrates OOP Inheritance and polymorphism.
 */
@Entity
@DiscriminatorValue("CHALLENGE")
public class Challenge extends FitnessChallenge {

    public Challenge() {
        super();
    }

    public Challenge(String title, String description, TargetMetric targetMetric,
                     Integer targetValue, LocalDateTime startDate, LocalDateTime endDate,
                     String badgeIconUrl, String rewardBadge) {
        super(title, description, targetMetric, targetValue, startDate, endDate, badgeIconUrl, rewardBadge);
    }

    public Challenge(String title, String description, TargetMetric targetMetric,
                     Integer targetValue, LocalDateTime startDate, LocalDateTime endDate,
                     String badgeIconUrl, String rewardBadge, Integer rewardXp) {
        super(title, description, targetMetric, targetValue, startDate, endDate, badgeIconUrl, rewardBadge, rewardXp);
    }
}
