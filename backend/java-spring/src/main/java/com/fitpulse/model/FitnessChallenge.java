package com.fitpulse.model;

import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Domain entity representing an athletic community endurance or strength challenge.
 * Demonstrates OOP Inheritance extending BaseEntity.
 */
@Entity
@Table(name = "fitness_challenges")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "challenge_type", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("COMMUNITY")
public class FitnessChallenge extends BaseEntity {

    @NotBlank(message = "Challenge title cannot be blank")
    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Target metric is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "target_metric", nullable = false, length = 30)
    private TargetMetric targetMetric;

    @NotNull(message = "Target value is required")
    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "badge_icon_url", length = 500)
    private String badgeIconUrl;

    @Column(name = "reward_badge", length = 100)
    private String rewardBadge;

    @Column(name = "reward_xp", nullable = false)
    private Integer rewardXp = 250;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ChallengeStatus status = ChallengeStatus.ACTIVE;

    public FitnessChallenge() {
        super();
        this.rewardXp = 250;
        this.status = ChallengeStatus.ACTIVE;
    }

    public FitnessChallenge(String title, String description, TargetMetric targetMetric,
                            Integer targetValue, LocalDateTime startDate, LocalDateTime endDate,
                            String badgeIconUrl, String rewardBadge) {
        super();
        this.title = title;
        this.description = description;
        this.targetMetric = targetMetric;
        this.targetValue = targetValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.badgeIconUrl = badgeIconUrl;
        this.rewardBadge = rewardBadge;
        this.rewardXp = 250;
        this.status = ChallengeStatus.ACTIVE;
    }

    public FitnessChallenge(String title, String description, TargetMetric targetMetric,
                            Integer targetValue, LocalDateTime startDate, LocalDateTime endDate,
                            String badgeIconUrl, String rewardBadge, Integer rewardXp) {
        this(title, description, targetMetric, targetValue, startDate, endDate, badgeIconUrl, rewardBadge);
        this.rewardXp = rewardXp != null ? rewardXp : 250;
    }

    // Encapsulation: Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TargetMetric getTargetMetric() {
        return targetMetric;
    }

    public void setTargetMetric(TargetMetric targetMetric) {
        this.targetMetric = targetMetric;
    }

    public Integer getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Integer targetValue) {
        this.targetValue = targetValue;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getBadgeIconUrl() {
        return badgeIconUrl;
    }

    public void setBadgeIconUrl(String badgeIconUrl) {
        this.badgeIconUrl = badgeIconUrl;
    }

    public String getRewardBadge() {
        return rewardBadge;
    }

    public void setRewardBadge(String rewardBadge) {
        this.rewardBadge = rewardBadge;
    }

    public Integer getRewardXp() {
        return rewardXp;
    }

    public void setRewardXp(Integer rewardXp) {
        this.rewardXp = rewardXp != null ? rewardXp : 250;
    }

    public ChallengeStatus getStatus() {
        return status;
    }

    public void setStatus(ChallengeStatus status) {
        this.status = status != null ? status : ChallengeStatus.ACTIVE;
    }
}
