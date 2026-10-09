package com.fitpulse.dto;

import com.fitpulse.model.Goal;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.model.enums.GoalType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Data Transfer Objects for Fitness Goal operations.
 * Demonstrates clean separation between API transport schema and domain models.
 */
public class GoalDtos {

    public static class GoalCreateRequest {
        @NotBlank(message = "Title cannot be blank")
        @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
        private String title;

        private String description;

        @NotNull(message = "Goal type is required")
        private GoalType goalType;

        @NotNull(message = "Target value is required")
        @DecimalMin(value = "0.1", message = "Target value must be positive")
        private Double targetValue;

        private LocalDateTime targetDate;

        public GoalCreateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public GoalType getGoalType() { return goalType; }
        public void setGoalType(GoalType goalType) { this.goalType = goalType; }

        public Double getTargetValue() { return targetValue; }
        public void setTargetValue(Double targetValue) { this.targetValue = targetValue; }

        public LocalDateTime getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDateTime targetDate) { this.targetDate = targetDate; }
    }

    public static class GoalProgressUpdateRequest {
        @NotNull(message = "Progress increment is required")
        @DecimalMin(value = "0.01", message = "Increment must be greater than zero")
        private Double increment;

        public GoalProgressUpdateRequest() {}

        public Double getIncrement() { return increment; }
        public void setIncrement(Double increment) { this.increment = increment; }
    }

    public static class GoalUpdateRequest {
        @NotBlank(message = "Title cannot be blank")
        @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
        private String title;

        private String description;

        @NotNull(message = "Goal type is required")
        private GoalType goalType;

        @NotNull(message = "Target value is required")
        @DecimalMin(value = "0.1", message = "Target value must be positive")
        private Double targetValue;

        @DecimalMin(value = "0.0", message = "Current value cannot be negative")
        private Double currentValue;

        private LocalDateTime targetDate;

        private GoalStatus status;

        public GoalUpdateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public GoalType getGoalType() { return goalType; }
        public void setGoalType(GoalType goalType) { this.goalType = goalType; }

        public Double getTargetValue() { return targetValue; }
        public void setTargetValue(Double targetValue) { this.targetValue = targetValue; }

        public Double getCurrentValue() { return currentValue; }
        public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }

        public LocalDateTime getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDateTime targetDate) { this.targetDate = targetDate; }

        public GoalStatus getStatus() { return status; }
        public void setStatus(GoalStatus status) { this.status = status; }
    }

    public static class GoalResponse {
        private Long id;
        private String title;
        private String description;
        private GoalType goalType;
        private String unit;
        private Double targetValue;
        private Double currentValue;
        private Double completionPercentage;
        private GoalStatus status;
        private LocalDateTime startDate;
        private LocalDateTime targetDate;
        private LocalDateTime completedAt;

        public GoalResponse() {}

        public static GoalResponse fromEntity(Goal goal) {
            GoalResponse resp = new GoalResponse();
            resp.setId(goal.getId());
            resp.setTitle(goal.getTitle());
            resp.setDescription(goal.getDescription());
            resp.setGoalType(goal.getGoalType());
            resp.setUnit(goal.getGoalType() != null ? goal.getGoalType().getUnit() : "");
            resp.setTargetValue(goal.getTargetValue());
            resp.setCurrentValue(goal.getCurrentValue());
            resp.setCompletionPercentage(goal.getCompletionPercentage());
            resp.setStatus(goal.getStatus());
            resp.setStartDate(goal.getStartDate());
            resp.setTargetDate(goal.getTargetDate());
            resp.setCompletedAt(goal.getCompletedAt());
            return resp;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public GoalType getGoalType() { return goalType; }
        public void setGoalType(GoalType goalType) { this.goalType = goalType; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public Double getTargetValue() { return targetValue; }
        public void setTargetValue(Double targetValue) { this.targetValue = targetValue; }

        public Double getCurrentValue() { return currentValue; }
        public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }

        public Double getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }

        public GoalStatus getStatus() { return status; }
        public void setStatus(GoalStatus status) { this.status = status; }

        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

        public LocalDateTime getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDateTime targetDate) { this.targetDate = targetDate; }

        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }
}
