package com.fitpulse.dto;

import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.enums.ActivityType;

import java.time.LocalDateTime;

/**
 * Data Transfer Objects for Activity & Audit Log queries.
 */
public class ActivityLogDtos {

    public static class ActivityLogResponse {
        private Long id;
        private Long userId;
        private String userEmail;
        private ActivityType activityType;
        private String activityDescription;
        private String description;
        private String entityType;
        private Long entityId;
        private String ipAddress;
        private LocalDateTime timestamp;

        public ActivityLogResponse() {}

        public static ActivityLogResponse fromEntity(ActivityLog log) {
            ActivityLogResponse resp = new ActivityLogResponse();
            resp.setId(log.getId());
            resp.setUserId(log.getUserId());
            resp.setUserEmail(log.getUserEmail());
            resp.setActivityType(log.getActivityType());
            resp.setActivityDescription(log.getActivityType() != null ? log.getActivityType().getDescription() : "");
            resp.setDescription(log.getDescription());
            resp.setEntityType(log.getEntityType());
            resp.setEntityId(log.getEntityId());
            resp.setIpAddress(log.getIpAddress());
            resp.setTimestamp(log.getTimestamp());
            return resp;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

        public ActivityType getActivityType() { return activityType; }
        public void setActivityType(ActivityType activityType) { this.activityType = activityType; }

        public String getActivityDescription() { return activityDescription; }
        public void setActivityDescription(String activityDescription) { this.activityDescription = activityDescription; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }

        public Long getEntityId() { return entityId; }
        public void setEntityId(Long entityId) { this.entityId = entityId; }

        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}
