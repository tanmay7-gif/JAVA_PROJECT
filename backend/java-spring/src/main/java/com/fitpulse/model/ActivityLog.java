package com.fitpulse.model;

import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.enums.ActivityType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Domain entity representing immutable system and user activity audit events.
 * Demonstrates:
 * - OOP Inheritance: Subclasses BaseEntity.
 * - Encapsulation: Factory constructors and protected state mutators.
 * - Auditability: Records actor identity, activity categorization, and temporal occurrence.
 */
@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_act_user_id", columnList = "user_id"),
    @Index(name = "idx_act_type", columnList = "activity_type"),
    @Index(name = "idx_act_timestamp", columnList = "timestamp")
})
public class ActivityLog extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email", length = 120)
    private String userEmail;

    @NotNull(message = "Activity type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 40)
    private ActivityType activityType;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @NotNull(message = "Timestamp is required")
    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ActivityLog() {
        super();
        this.timestamp = LocalDateTime.now();
    }

    public ActivityLog(Long userId, String userEmail, ActivityType activityType,
                       String description, String entityType, Long entityId, String ipAddress) {
        super();
        this.userId = userId;
        this.userEmail = userEmail;
        this.activityType = activityType;
        this.description = description;
        this.entityType = entityType;
        this.entityId = entityId;
        this.ipAddress = ipAddress;
        this.timestamp = LocalDateTime.now();
    }

    // Static Factory Construction (OOP Best Practice)
    public static ActivityLog of(Long userId, String userEmail, ActivityType activityType,
                                 String description, String entityType, Long entityId, String ipAddress) {
        return new ActivityLog(userId, userEmail, activityType, description, entityType, entityId, ipAddress);
    }

    public static ActivityLog of(User user, ActivityType activityType, String description,
                                 String entityType, Long entityId) {
        Long uid = user != null ? user.getId() : null;
        String email = user != null ? user.getEmail() : "anonymous";
        return new ActivityLog(uid, email, activityType, description, entityType, entityId, "127.0.0.1");
    }

    public static ActivityLog system(ActivityType activityType, String description) {
        return new ActivityLog(null, "system@fitpulse.local", activityType, description, "SYSTEM", null, "127.0.0.1");
    }

    // Encapsulation: Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }
}
