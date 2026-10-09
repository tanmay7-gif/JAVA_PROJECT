package com.fitpulse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.base.Trackable;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.model.enums.GoalType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Domain entity representing an athlete's personal fitness target or milestone.
 * Demonstrates:
 * - OOP Inheritance: Subclasses BaseEntity.
 * - Interface Implementation: Implements Trackable.
 * - Encapsulation: State is private and validated.
 * - Rich Domain Behavior: Encapsulates progress calculation, status transition logic.
 */
@Entity
@Table(name = "fitness_goals", indexes = {
    @Index(name = "idx_goal_user", columnList = "user_id"),
    @Index(name = "idx_goal_status", columnList = "status")
})
public class Goal extends BaseEntity implements Trackable {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotBlank(message = "Goal title cannot be blank")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String description;

    @NotNull(message = "Goal type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false, length = 30)
    private GoalType goalType;

    @NotNull(message = "Target value is required")
    @DecimalMin(value = "0.1", message = "Target value must be greater than zero")
    @Column(name = "target_value", nullable = false)
    private Double targetValue;

    @Column(name = "current_value", nullable = false)
    private Double currentValue = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "target_date")
    private LocalDateTime targetDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public Goal() {
        super();
        this.startDate = LocalDateTime.now();
        this.currentValue = 0.0;
        this.status = GoalStatus.IN_PROGRESS;
    }

    public Goal(User user, String title, String description, GoalType goalType,
                Double targetValue, LocalDateTime targetDate) {
        super();
        this.user = user;
        this.title = title;
        this.description = description;
        this.goalType = goalType;
        this.targetValue = targetValue;
        this.currentValue = 0.0;
        this.status = GoalStatus.IN_PROGRESS;
        this.startDate = LocalDateTime.now();
        this.targetDate = targetDate;
    }

    // Domain Logic & Encapsulated Progress Tracking
    public void incrementProgress(Double increment) {
        if (increment != null && increment > 0 && this.status == GoalStatus.IN_PROGRESS) {
            this.currentValue = (this.currentValue == null ? 0.0 : this.currentValue) + increment;
            if (this.currentValue >= this.targetValue) {
                markAsCompleted();
            }
        }
    }

    public void markAsCompleted() {
        this.status = GoalStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void abandon() {
        this.status = GoalStatus.ABANDONED;
    }

    @Override
    public Double getCompletionPercentage() {
        if (targetValue == null || targetValue <= 0.0) return 0.0;
        double current = currentValue != null ? currentValue : 0.0;
        double percentage = (current / targetValue) * 100.0;
        return Math.min(100.0, Math.round(percentage * 10.0) / 10.0);
    }

    @Override
    public boolean isCompleted() {
        return this.status == GoalStatus.COMPLETED;
    }

    // Encapsulated Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

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

    public GoalType getGoalType() {
        return goalType;
    }

    public void setGoalType(GoalType goalType) {
        this.goalType = goalType;
    }

    public Double getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Double targetValue) {
        this.targetValue = targetValue;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue != null ? currentValue : 0.0;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status != null ? status : GoalStatus.IN_PROGRESS;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDateTime targetDate) {
        this.targetDate = targetDate;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
