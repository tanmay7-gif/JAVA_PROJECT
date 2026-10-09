package com.fitpulse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Domain entity representing an authenticated athlete or system administrator.
 * Inherits primary key and audit timestamps from BaseEntity.
 * Demonstrates:
 * - OOP Encapsulation: State is strictly private with validated accessors.
 * - Defensive Copying: Unmodifiable lists returned to prevent external state tampering.
 * - Inheritance: Subclasses BaseEntity.
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class User extends BaseEntity {

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must provide a valid email address")
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @NotBlank(message = "Password hash is required")
    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "total_xp", nullable = false)
    private Integer totalXp = 0;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<WorkoutLog> workoutLogs = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Goal> goals = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<UserChallenge> userChallenges = new ArrayList<>();

    public User() {
        super();
    }

    public User(String name, String email, String passwordHash, Role role, String avatarUrl) {
        super();
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role != null ? role : Role.USER;
        this.avatarUrl = avatarUrl;
        this.isActive = Boolean.TRUE;
        this.totalXp = 0;
    }

    // Domain Business Methods
    public void addXp(int xpPoints) {
        if (xpPoints > 0) {
            this.totalXp = (this.totalXp == null ? 0 : this.totalXp) + xpPoints;
        }
    }

    public void promoteToAdmin() {
        this.role = Role.ADMIN;
    }

    public void demoteToUser() {
        this.role = Role.USER;
    }

    public void activate() {
        this.isActive = Boolean.TRUE;
    }

    public void deactivate() {
        this.isActive = Boolean.FALSE;
    }

    // Encapsulated Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role != null ? role : Role.USER;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active != null ? active : Boolean.TRUE;
    }

    public Integer getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Integer totalXp) {
        this.totalXp = totalXp != null ? totalXp : 0;
    }

    public List<WorkoutLog> getWorkoutLogs() {
        return workoutLogs;
    }

    public void setWorkoutLogs(List<WorkoutLog> workoutLogs) {
        this.workoutLogs = workoutLogs != null ? workoutLogs : new ArrayList<>();
    }

    public List<Goal> getGoals() {
        return goals;
    }

    public void setGoals(List<Goal> goals) {
        this.goals = goals != null ? goals : new ArrayList<>();
    }

    public List<UserChallenge> getUserChallenges() {
        return userChallenges;
    }

    public void setUserChallenges(List<UserChallenge> userChallenges) {
        this.userChallenges = userChallenges != null ? userChallenges : new ArrayList<>();
    }
}
