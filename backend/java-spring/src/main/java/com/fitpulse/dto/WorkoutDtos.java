package com.fitpulse.dto;

import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Objects for Workout operations.
 * Enforces strong input validation constraints across Create and Update workflows.
 */
public class WorkoutDtos {

    /**
     * Payload for creating and logging a new workout session.
     */
    public static class WorkoutCreateRequest {

        @NotNull(message = "Workout modality is required")
        private WorkoutType workoutType;

        @NotNull(message = "Duration in minutes is required")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 1440, message = "Duration cannot exceed 1440 minutes (24 hours)")
        private Integer durationMinutes;

        private Intensity intensity = Intensity.MEDIUM;

        @Min(value = 0, message = "Calories burned cannot be negative")
        private Integer caloriesBurned = 0;

        @Min(value = 0, message = "Volume load cannot be negative")
        private Double volumeKg = 0.0;

        @PastOrPresent(message = "Workout log time cannot be in the future")
        private LocalDateTime loggedAt;

        @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
        private String notes;

        public WorkoutCreateRequest() {}

        public WorkoutType getWorkoutType() { return workoutType; }
        public void setWorkoutType(WorkoutType workoutType) { this.workoutType = workoutType; }

        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

        public Intensity getIntensity() { return intensity != null ? intensity : Intensity.MEDIUM; }
        public void setIntensity(Intensity intensity) { this.intensity = intensity; }

        public Integer getCaloriesBurned() { return caloriesBurned != null ? caloriesBurned : 0; }
        public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }

        public Double getVolumeKg() { return volumeKg != null ? volumeKg : 0.0; }
        public void setVolumeKg(Double volumeKg) { this.volumeKg = volumeKg; }

        public LocalDateTime getLoggedAt() { return loggedAt; }
        public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    /**
     * Payload for modifying and updating an existing workout session.
     */
    public static class WorkoutUpdateRequest {

        private WorkoutType workoutType;

        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 1440, message = "Duration cannot exceed 1440 minutes (24 hours)")
        private Integer durationMinutes;

        private Intensity intensity;

        @Min(value = 0, message = "Calories burned cannot be negative")
        private Integer caloriesBurned;

        @Min(value = 0, message = "Volume load cannot be negative")
        private Double volumeKg;

        @PastOrPresent(message = "Workout log time cannot be in the future")
        private LocalDateTime loggedAt;

        @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
        private String notes;

        public WorkoutUpdateRequest() {}

        public WorkoutType getWorkoutType() { return workoutType; }
        public void setWorkoutType(WorkoutType workoutType) { this.workoutType = workoutType; }

        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

        public Intensity getIntensity() { return intensity; }
        public void setIntensity(Intensity intensity) { this.intensity = intensity; }

        public Integer getCaloriesBurned() { return caloriesBurned; }
        public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }

        public Double getVolumeKg() { return volumeKg; }
        public void setVolumeKg(Double volumeKg) { this.volumeKg = volumeKg; }

        public LocalDateTime getLoggedAt() { return loggedAt; }
        public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    /**
     * Complete response representation of a persisted workout session.
     */
    public static class WorkoutResponse {
        private Long id;
        private WorkoutType type;
        private Integer durationMinutes;
        private Intensity intensity;
        private Integer caloriesBurned;
        private Double volumeKg;
        private LocalDateTime loggedAt;
        private String notes;
        private Long userId;
        private String userName;

        public WorkoutResponse() {}

        public WorkoutResponse(Long id, WorkoutType type, Integer durationMinutes,
                               Intensity intensity, Integer caloriesBurned, Double volumeKg,
                               LocalDateTime loggedAt, String notes, Long userId, String userName) {
            this.id = id;
            this.type = type;
            this.durationMinutes = durationMinutes;
            this.intensity = intensity;
            this.caloriesBurned = caloriesBurned;
            this.volumeKg = volumeKg != null ? volumeKg : 0.0;
            this.loggedAt = loggedAt;
            this.notes = notes;
            this.userId = userId;
            this.userName = userName;
        }

        public WorkoutResponse(Long id, WorkoutType type, Integer durationMinutes,
                               Intensity intensity, Integer caloriesBurned, LocalDateTime loggedAt, String notes) {
            this(id, type, durationMinutes, intensity, caloriesBurned, 0.0, loggedAt, notes, null, null);
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public WorkoutType getType() { return type; }
        public void setType(WorkoutType type) { this.type = type; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public Intensity getIntensity() { return intensity; }
        public void setIntensity(Intensity intensity) { this.intensity = intensity; }
        public Integer getCaloriesBurned() { return caloriesBurned; }
        public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }
        public Double getVolumeKg() { return volumeKg; }
        public void setVolumeKg(Double volumeKg) { this.volumeKg = volumeKg; }
        public LocalDateTime getLoggedAt() { return loggedAt; }
        public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
    }

    /**
     * Response payload for polymorphic MET calorie burn estimation.
     */
    public static class CalorieEstimateResponse {
        private WorkoutType type;
        private Intensity intensity;
        private int durationMinutes;
        private int estimatedCalories;

        public CalorieEstimateResponse() {}

        public CalorieEstimateResponse(WorkoutType type, Intensity intensity, int durationMinutes, int estimatedCalories) {
            this.type = type;
            this.intensity = intensity;
            this.durationMinutes = durationMinutes;
            this.estimatedCalories = estimatedCalories;
        }

        public WorkoutType getType() { return type; }
        public void setType(WorkoutType type) { this.type = type; }
        public Intensity getIntensity() { return intensity; }
        public void setIntensity(Intensity intensity) { this.intensity = intensity; }
        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
        public int getEstimatedCalories() { return estimatedCalories; }
        public void setEstimatedCalories(int estimatedCalories) { this.estimatedCalories = estimatedCalories; }
    }

    public static class DailyTrendPoint {
        private String day;
        private String date;
        private int calories;
        private int duration;

        public DailyTrendPoint() {}
        public DailyTrendPoint(String day, String date, int calories, int duration) {
            this.day = day;
            this.date = date;
            this.calories = calories;
            this.duration = duration;
        }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }
        public int getDuration() { return duration; }
        public void setDuration(int duration) { this.duration = duration; }
    }

    public static class DisciplineDistributionDto {
        private String name;
        private int count;
        private double percentage;

        public DisciplineDistributionDto() {}
        public DisciplineDistributionDto(String name, int count, int percentage) {
            this.name = name;
            this.count = count;
            this.percentage = percentage;
        }
        public DisciplineDistributionDto(String name, int count, double percentage) {
            this.name = name;
            this.count = count;
            this.percentage = percentage;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class GoalProgressSummaryDto {
        private int totalGoals;
        private int activeGoals;
        private int completedGoals;
        private double averageCompletionPercentage;

        public GoalProgressSummaryDto() {}
        public GoalProgressSummaryDto(int totalGoals, int activeGoals, int completedGoals, double averageCompletionPercentage) {
            this.totalGoals = totalGoals;
            this.activeGoals = activeGoals;
            this.completedGoals = completedGoals;
            this.averageCompletionPercentage = averageCompletionPercentage;
        }

        public int getTotalGoals() { return totalGoals; }
        public void setTotalGoals(int totalGoals) { this.totalGoals = totalGoals; }
        public int getActiveGoals() { return activeGoals; }
        public void setActiveGoals(int activeGoals) { this.activeGoals = activeGoals; }
        public int getCompletedGoals() { return completedGoals; }
        public void setCompletedGoals(int completedGoals) { this.completedGoals = completedGoals; }
        public double getAverageCompletionPercentage() { return averageCompletionPercentage; }
        public void setAverageCompletionPercentage(double averageCompletionPercentage) { this.averageCompletionPercentage = averageCompletionPercentage; }
    }

    public static class ChallengeProgressSummaryDto {
        private int enrolledChallenges;
        private int activeChallenges;
        private int completedChallenges;
        private double completionRate;

        public ChallengeProgressSummaryDto() {}
        public ChallengeProgressSummaryDto(int enrolledChallenges, int activeChallenges, int completedChallenges, double completionRate) {
            this.enrolledChallenges = enrolledChallenges;
            this.activeChallenges = activeChallenges;
            this.completedChallenges = completedChallenges;
            this.completionRate = completionRate;
        }

        public int getEnrolledChallenges() { return enrolledChallenges; }
        public void setEnrolledChallenges(int enrolledChallenges) { this.enrolledChallenges = enrolledChallenges; }
        public int getActiveChallenges() { return activeChallenges; }
        public void setActiveChallenges(int activeChallenges) { this.activeChallenges = activeChallenges; }
        public int getCompletedChallenges() { return completedChallenges; }
        public void setCompletedChallenges(int completedChallenges) { this.completedChallenges = completedChallenges; }
        public double getCompletionRate() { return completionRate; }
        public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
    }

    public static class AnalyticsSummaryMetrics {
        private double weeklyWorkoutHours;
        private int weeklyCaloriesBurned;
        private int weeklyWorkoutsCount;
        private double monthlyWorkoutHours;
        private int monthlyCaloriesBurned;
        private int monthlyWorkoutsCount;
        private int activeChallengesCount;
        private int totalLifetimeCalories;
        private long totalLifetimeWorkouts;
        private double totalLifetimeHours;

        public AnalyticsSummaryMetrics() {}

        public double getWeeklyWorkoutHours() { return weeklyWorkoutHours; }
        public void setWeeklyWorkoutHours(double weeklyWorkoutHours) { this.weeklyWorkoutHours = weeklyWorkoutHours; }
        public int getWeeklyCaloriesBurned() { return weeklyCaloriesBurned; }
        public void setWeeklyCaloriesBurned(int weeklyCaloriesBurned) { this.weeklyCaloriesBurned = weeklyCaloriesBurned; }
        public int getWeeklyWorkoutsCount() { return weeklyWorkoutsCount; }
        public void setWeeklyWorkoutsCount(int weeklyWorkoutsCount) { this.weeklyWorkoutsCount = weeklyWorkoutsCount; }
        public double getMonthlyWorkoutHours() { return monthlyWorkoutHours; }
        public void setMonthlyWorkoutHours(double monthlyWorkoutHours) { this.monthlyWorkoutHours = monthlyWorkoutHours; }
        public int getMonthlyCaloriesBurned() { return monthlyCaloriesBurned; }
        public void setMonthlyCaloriesBurned(int monthlyCaloriesBurned) { this.monthlyCaloriesBurned = monthlyCaloriesBurned; }
        public int getMonthlyWorkoutsCount() { return monthlyWorkoutsCount; }
        public void setMonthlyWorkoutsCount(int monthlyWorkoutsCount) { this.monthlyWorkoutsCount = monthlyWorkoutsCount; }
        public int getActiveChallengesCount() { return activeChallengesCount; }
        public void setActiveChallengesCount(int activeChallengesCount) { this.activeChallengesCount = activeChallengesCount; }
        public int getTotalLifetimeCalories() { return totalLifetimeCalories; }
        public void setTotalLifetimeCalories(int totalLifetimeCalories) { this.totalLifetimeCalories = totalLifetimeCalories; }
        public long getTotalLifetimeWorkouts() { return totalLifetimeWorkouts; }
        public void setTotalLifetimeWorkouts(long totalLifetimeWorkouts) { this.totalLifetimeWorkouts = totalLifetimeWorkouts; }
        public double getTotalLifetimeHours() { return totalLifetimeHours; }
        public void setTotalLifetimeHours(double totalLifetimeHours) { this.totalLifetimeHours = totalLifetimeHours; }
    }

    public static class AnalyticsSummaryDto {
        private double weeklyWorkoutHours;
        private int weeklyCaloriesBurned;
        private int weeklyWorkoutsCount;
        private double monthlyWorkoutHours;
        private int monthlyCaloriesBurned;
        private int monthlyWorkoutsCount;
        private int activeChallengesCount;
        private int totalLifetimeCalories;
        private long totalLifetimeWorkouts;
        private double totalLifetimeHours;
        private List<DailyTrendPoint> dailyTrend;
        private List<DisciplineDistributionDto> typeBreakdown;
        private GoalProgressSummaryDto goalProgress;
        private ChallengeProgressSummaryDto challengeProgress;

        public AnalyticsSummaryDto() {}

        public AnalyticsSummaryMetrics getSummary() {
            AnalyticsSummaryMetrics metrics = new AnalyticsSummaryMetrics();
            metrics.setWeeklyWorkoutHours(this.weeklyWorkoutHours);
            metrics.setWeeklyCaloriesBurned(this.weeklyCaloriesBurned);
            metrics.setWeeklyWorkoutsCount(this.weeklyWorkoutsCount);
            metrics.setMonthlyWorkoutHours(this.monthlyWorkoutHours);
            metrics.setMonthlyCaloriesBurned(this.monthlyCaloriesBurned);
            metrics.setMonthlyWorkoutsCount(this.monthlyWorkoutsCount);
            metrics.setActiveChallengesCount(this.activeChallengesCount);
            metrics.setTotalLifetimeCalories(this.totalLifetimeCalories);
            metrics.setTotalLifetimeWorkouts(this.totalLifetimeWorkouts);
            metrics.setTotalLifetimeHours(this.totalLifetimeHours);
            return metrics;
        }

        public double getWeeklyWorkoutHours() { return weeklyWorkoutHours; }
        public void setWeeklyWorkoutHours(double weeklyWorkoutHours) { this.weeklyWorkoutHours = weeklyWorkoutHours; }
        public int getWeeklyCaloriesBurned() { return weeklyCaloriesBurned; }
        public void setWeeklyCaloriesBurned(int weeklyCaloriesBurned) { this.weeklyCaloriesBurned = weeklyCaloriesBurned; }
        public int getWeeklyWorkoutsCount() { return weeklyWorkoutsCount; }
        public void setWeeklyWorkoutsCount(int weeklyWorkoutsCount) { this.weeklyWorkoutsCount = weeklyWorkoutsCount; }
        public double getMonthlyWorkoutHours() { return monthlyWorkoutHours; }
        public void setMonthlyWorkoutHours(double monthlyWorkoutHours) { this.monthlyWorkoutHours = monthlyWorkoutHours; }
        public int getMonthlyCaloriesBurned() { return monthlyCaloriesBurned; }
        public void setMonthlyCaloriesBurned(int monthlyCaloriesBurned) { this.monthlyCaloriesBurned = monthlyCaloriesBurned; }
        public int getMonthlyWorkoutsCount() { return monthlyWorkoutsCount; }
        public void setMonthlyWorkoutsCount(int monthlyWorkoutsCount) { this.monthlyWorkoutsCount = monthlyWorkoutsCount; }
        public int getActiveChallengesCount() { return activeChallengesCount; }
        public void setActiveChallengesCount(int activeChallengesCount) { this.activeChallengesCount = activeChallengesCount; }
        public int getTotalLifetimeCalories() { return totalLifetimeCalories; }
        public void setTotalLifetimeCalories(int totalLifetimeCalories) { this.totalLifetimeCalories = totalLifetimeCalories; }
        public long getTotalLifetimeWorkouts() { return totalLifetimeWorkouts; }
        public void setTotalLifetimeWorkouts(long totalLifetimeWorkouts) { this.totalLifetimeWorkouts = totalLifetimeWorkouts; }
        public double getTotalLifetimeHours() { return totalLifetimeHours; }
        public void setTotalLifetimeHours(double totalLifetimeHours) { this.totalLifetimeHours = totalLifetimeHours; }
        public List<DailyTrendPoint> getDailyTrend() { return dailyTrend; }
        public void setDailyTrend(List<DailyTrendPoint> dailyTrend) { this.dailyTrend = dailyTrend; }
        public List<DailyTrendPoint> getDailyTrends() { return dailyTrend; }
        public void setDailyTrends(List<DailyTrendPoint> dailyTrend) { this.dailyTrend = dailyTrend; }
        public List<DisciplineDistributionDto> getTypeBreakdown() { return typeBreakdown; }
        public void setTypeBreakdown(List<DisciplineDistributionDto> typeBreakdown) { this.typeBreakdown = typeBreakdown; }
        public List<DisciplineDistributionDto> getDisciplineDistribution() { return typeBreakdown; }
        public void setDisciplineDistribution(List<DisciplineDistributionDto> typeBreakdown) { this.typeBreakdown = typeBreakdown; }
        public GoalProgressSummaryDto getGoalProgress() { return goalProgress; }
        public void setGoalProgress(GoalProgressSummaryDto goalProgress) { this.goalProgress = goalProgress; }
        public ChallengeProgressSummaryDto getChallengeProgress() { return challengeProgress; }
        public void setChallengeProgress(ChallengeProgressSummaryDto challengeProgress) { this.challengeProgress = challengeProgress; }
    }
}
