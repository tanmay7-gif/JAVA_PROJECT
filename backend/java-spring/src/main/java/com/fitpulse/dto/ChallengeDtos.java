package com.fitpulse.dto;

import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ChallengeDtos {

    public static class ChallengeCreateRequest {
        @NotBlank
        private String title;
        private String description;
        @NotNull
        private TargetMetric targetMetric;
        @NotNull
        private Integer targetValue;
        @NotNull
        private LocalDateTime startDate;
        @NotNull
        private LocalDateTime endDate;
        private String rewardBadge;
        private Integer rewardXp;

        public ChallengeCreateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TargetMetric getTargetMetric() { return targetMetric; }
        public void setTargetMetric(TargetMetric targetMetric) { this.targetMetric = targetMetric; }
        public Integer getTargetValue() { return targetValue; }
        public void setTargetValue(Integer targetValue) { this.targetValue = targetValue; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public String getRewardBadge() { return rewardBadge; }
        public void setRewardBadge(String rewardBadge) { this.rewardBadge = rewardBadge; }
        public Integer getRewardXp() { return rewardXp; }
        public void setRewardXp(Integer rewardXp) { this.rewardXp = rewardXp; }
    }

    public static class ChallengeUpdateRequest {
        private String title;
        private String description;
        private TargetMetric targetMetric;
        private Integer targetValue;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String rewardBadge;
        private Integer rewardXp;
        private ChallengeStatus status;

        public ChallengeUpdateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TargetMetric getTargetMetric() { return targetMetric; }
        public void setTargetMetric(TargetMetric targetMetric) { this.targetMetric = targetMetric; }
        public Integer getTargetValue() { return targetValue; }
        public void setTargetValue(Integer targetValue) { this.targetValue = targetValue; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public String getRewardBadge() { return rewardBadge; }
        public void setRewardBadge(String rewardBadge) { this.rewardBadge = rewardBadge; }
        public Integer getRewardXp() { return rewardXp; }
        public void setRewardXp(Integer rewardXp) { this.rewardXp = rewardXp; }
        public ChallengeStatus getStatus() { return status; }
        public void setStatus(ChallengeStatus status) { this.status = status; }
    }

    public static class ChallengeResponse {
        private Long id;
        private String title;
        private String description;
        private TargetMetric targetMetric;
        private Integer targetValue;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String rewardBadge;
        private boolean isJoined;
        private int progressPercent;

        public ChallengeResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TargetMetric getTargetMetric() { return targetMetric; }
        public void setTargetMetric(TargetMetric targetMetric) { this.targetMetric = targetMetric; }
        public Integer getTargetValue() { return targetValue; }
        public void setTargetValue(Integer targetValue) { this.targetValue = targetValue; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        public String getRewardBadge() { return rewardBadge; }
        public void setRewardBadge(String rewardBadge) { this.rewardBadge = rewardBadge; }
        public boolean isJoined() { return isJoined; }
        public void setJoined(boolean joined) { isJoined = joined; }
        public int getProgressPercent() { return progressPercent; }
        public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }
    }

    public static class UserChallengeResponse {
        private Long id;
        private ChallengeResponse challenge;
        private ChallengeStatus status;
        private int currentProgress;
        private int progressPercentage;
        private LocalDateTime completedAt;

        public UserChallengeResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public ChallengeResponse getChallenge() { return challenge; }
        public void setChallenge(ChallengeResponse challenge) { this.challenge = challenge; }
        public ChallengeStatus getStatus() { return status; }
        public void setStatus(ChallengeStatus status) { this.status = status; }
        public int getCurrentProgress() { return currentProgress; }
        public void setCurrentProgress(int currentProgress) { this.currentProgress = currentProgress; }
        public int getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }

    public static class ParticipantSummary {
        private Long enrollmentId;
        private Long userId;
        private String userName;
        private String userEmail;
        private int currentProgress;
        private int progressPercentage;
        private ChallengeStatus status;
        private LocalDateTime enrolledAt;
        private LocalDateTime completedAt;

        public ParticipantSummary() {}

        public ParticipantSummary(Long enrollmentId, Long userId, String userName, String userEmail,
                                  int currentProgress, int progressPercentage, ChallengeStatus status,
                                  LocalDateTime enrolledAt, LocalDateTime completedAt) {
            this.enrollmentId = enrollmentId;
            this.userId = userId;
            this.userName = userName;
            this.userEmail = userEmail;
            this.currentProgress = currentProgress;
            this.progressPercentage = progressPercentage;
            this.status = status;
            this.enrolledAt = enrolledAt;
            this.completedAt = completedAt;
        }

        public Long getEnrollmentId() { return enrollmentId; }
        public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public int getCurrentProgress() { return currentProgress; }
        public void setCurrentProgress(int currentProgress) { this.currentProgress = currentProgress; }
        public int getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
        public ChallengeStatus getStatus() { return status; }
        public void setStatus(ChallengeStatus status) { this.status = status; }
        public LocalDateTime getEnrolledAt() { return enrolledAt; }
        public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }

    public static class ChallengeMonitorResponse {
        private ChallengeResponse challenge;
        private int totalParticipants;
        private int inProgressCount;
        private int completedCount;
        private double completionRate;
        private java.util.List<ParticipantSummary> participants;

        public ChallengeMonitorResponse() {}

        public ChallengeResponse getChallenge() { return challenge; }
        public void setChallenge(ChallengeResponse challenge) { this.challenge = challenge; }
        public int getTotalParticipants() { return totalParticipants; }
        public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }
        public int getInProgressCount() { return inProgressCount; }
        public void setInProgressCount(int inProgressCount) { this.inProgressCount = inProgressCount; }
        public int getCompletedCount() { return completedCount; }
        public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
        public double getCompletionRate() { return completionRate; }
        public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
        public java.util.List<ParticipantSummary> getParticipants() { return participants; }
        public void setParticipants(java.util.List<ParticipantSummary> participants) { this.participants = participants; }
    }
}
