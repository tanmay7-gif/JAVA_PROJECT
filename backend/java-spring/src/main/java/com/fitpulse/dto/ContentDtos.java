package com.fitpulse.dto;

import com.fitpulse.model.enums.ContentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ContentDtos {

    public static class ContentCreateRequest {
        @NotBlank
        private String title;
        @NotBlank
        private String description;
        @NotBlank
        private String category;
        private String thumbnailUrl;

        public ContentCreateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    }

    public static class ModerationRequest {
        @NotNull
        private ContentStatus action;
        private String reviewNotes;

        public ModerationRequest() {}

        public ContentStatus getAction() { return action; }
        public void setAction(ContentStatus action) { this.action = action; }
        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    }

    public static class ContentResponse {
        private Long id;
        private String creatorName;
        private String title;
        private String description;
        private String category;
        private ContentStatus status;
        private String thumbnailUrl;
        private int upvotesCount;
        private LocalDateTime createdAt;

        public ContentResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCreatorName() { return creatorName; }
        public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public ContentStatus getStatus() { return status; }
        public void setStatus(ContentStatus status) { this.status = status; }
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
        public int getUpvotesCount() { return upvotesCount; }
        public void setUpvotesCount(int upvotesCount) { this.upvotesCount = upvotesCount; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
