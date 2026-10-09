package com.fitpulse.model;

import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.base.CalorieCalculable;
import com.fitpulse.model.base.Trackable;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Core domain entity representing an athletic training session.
 * Demonstrates:
 * - OOP Inheritance: Subclasses BaseEntity.
 * - Interface Implementation: Implements Trackable and CalorieCalculable.
 * - Encapsulation: Validated state modifiers, private attributes.
 * - Domain Methods: Metric evaluation and completion logic.
 */
@Entity
@Table(name = "workout_logs", indexes = {
    @Index(name = "idx_workout_user", columnList = "user_id"),
    @Index(name = "idx_workout_date", columnList = "logged_at")
})
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "record_type", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("WORKOUT")
public class Workout extends BaseEntity implements Trackable, CalorieCalculable {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Workout modality is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "workout_type", nullable = false, length = 30)
    private WorkoutType workoutType;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @NotNull(message = "Intensity is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Intensity intensity;

    @NotNull(message = "Calories burned is required")
    @Min(value = 0, message = "Calories cannot be negative")
    @Column(name = "calories_burned", nullable = false)
    private Integer caloriesBurned;

    @Column(name = "volume_kg")
    private Double volumeKg = 0.0;

    @NotNull(message = "Log timestamp is required")
    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @Column(length = 1000)
    private String notes;

    public Workout() {
        super();
        this.loggedAt = LocalDateTime.now();
        this.volumeKg = 0.0;
    }

    public Workout(User user, WorkoutType workoutType, Integer durationMinutes,
                   Intensity intensity, Integer caloriesBurned, LocalDateTime loggedAt, String notes) {
        super();
        this.user = user;
        this.workoutType = workoutType;
        this.durationMinutes = durationMinutes;
        this.intensity = intensity;
        this.caloriesBurned = caloriesBurned;
        this.loggedAt = loggedAt != null ? loggedAt : LocalDateTime.now();
        this.notes = notes;
        this.volumeKg = 0.0;
    }

    public Workout(User user, WorkoutType workoutType, Integer durationMinutes,
                   Intensity intensity, Integer caloriesBurned, Double volumeKg, LocalDateTime loggedAt, String notes) {
        this(user, workoutType, durationMinutes, intensity, caloriesBurned, loggedAt, notes);
        this.volumeKg = volumeKg != null ? volumeKg : 0.0;
    }

    // Domain Methods from Interfaces
    @Override
    public Double getCompletionPercentage() {
        return 100.0; // Completed session
    }

    @Override
    public boolean isCompleted() {
        return true;
    }

    // Encapsulation: Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WorkoutType getWorkoutType() {
        return workoutType;
    }

    public void setWorkoutType(WorkoutType workoutType) {
        this.workoutType = workoutType;
    }

    @Override
    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Intensity getIntensity() {
        return intensity;
    }

    public void setIntensity(Intensity intensity) {
        this.intensity = intensity;
    }

    @Override
    public Integer getCaloriesBurned() {
        return caloriesBurned;
    }

    public void setCaloriesBurned(Integer caloriesBurned) {
        this.caloriesBurned = caloriesBurned;
    }

    public Double getVolumeKg() {
        return volumeKg;
    }

    public void setVolumeKg(Double volumeKg) {
        this.volumeKg = volumeKg != null ? volumeKg : 0.0;
    }

    public LocalDateTime getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(LocalDateTime loggedAt) {
        this.loggedAt = loggedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
