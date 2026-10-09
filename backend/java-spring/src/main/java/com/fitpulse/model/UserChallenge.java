package com.fitpulse.model;

import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.base.Trackable;
import com.fitpulse.model.enums.ChallengeStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Domain entity representing an athlete's enrollment and progress in a fitness challenge.
 * Demonstrates OOP Inheritance and Interface Implementation.
 */
@Entity
@Table(name = "user_challenges", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_challenge", columnNames = {"user_id", "challenge_id"})
})
public class UserChallenge extends BaseEntity implements Trackable {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "challenge_id", nullable = false)
    private FitnessChallenge challenge;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChallengeStatus status = ChallengeStatus.IN_PROGRESS;

    @NotNull
    @Column(name = "current_progress", nullable = false)
    private Integer currentProgress = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public UserChallenge() {
        super();
        this.status = ChallengeStatus.IN_PROGRESS;
        this.currentProgress = 0;
    }

    public UserChallenge(User user, FitnessChallenge challenge) {
        super();
        this.user = user;
        this.challenge = challenge;
        this.status = ChallengeStatus.IN_PROGRESS;
        this.currentProgress = 0;
    }

    @Override
    public Double getCompletionPercentage() {
        if (challenge == null || challenge.getTargetValue() == null || challenge.getTargetValue() <= 0) {
            return 0.0;
        }
        int progress = currentProgress != null ? currentProgress : 0;
        double pct = ((double) progress / challenge.getTargetValue()) * 100.0;
        return Math.min(100.0, Math.round(pct * 10.0) / 10.0);
    }

    @Override
    public boolean isCompleted() {
        return this.status == ChallengeStatus.COMPLETED;
    }

    public int getProgressPercentage() {
        return getCompletionPercentage().intValue();
    }

    // Encapsulation: Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public FitnessChallenge getChallenge() {
        return challenge;
    }

    public void setChallenge(FitnessChallenge challenge) {
        this.challenge = challenge;
    }

    public ChallengeStatus getStatus() {
        return status;
    }

    public void setStatus(ChallengeStatus status) {
        this.status = status != null ? status : ChallengeStatus.IN_PROGRESS;
    }

    public Integer getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(Integer currentProgress) {
        this.currentProgress = currentProgress != null ? currentProgress : 0;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
