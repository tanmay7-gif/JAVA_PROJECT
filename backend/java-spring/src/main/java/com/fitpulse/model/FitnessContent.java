package com.fitpulse.model;

import com.fitpulse.model.base.BaseEntity;
import com.fitpulse.model.enums.ContentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Domain entity representing curated or user-contributed fitness articles, routines, and educational videos.
 * Demonstrates:
 * - OOP Inheritance: Subclasses BaseEntity.
 * - Encapsulation: Validated mutators and controlled state transitions.
 */
@Entity
@Table(name = "fitness_content", indexes = {
    @Index(name = "idx_content_status", columnList = "status"),
    @Index(name = "idx_content_category", columnList = "category")
})
public class FitnessContent extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @NotBlank(message = "Title cannot be blank")
    @Column(nullable = false, length = 180)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Category cannot be blank")
    @Column(nullable = false, length = 50)
    private String category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ContentStatus status = ContentStatus.PENDING;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "upvotes_count", nullable = false)
    private Integer upvotesCount = 0;

    @Column(name = "views_count", nullable = false)
    private Integer viewsCount = 0;

    @Column(name = "read_time_minutes")
    private Integer readTimeMinutes = 5;

    public FitnessContent() {
        super();
        this.upvotesCount = 0;
        this.viewsCount = 0;
        this.readTimeMinutes = 5;
        this.status = ContentStatus.PENDING;
    }

    public FitnessContent(User creator, String title, String description, String category,
                          String thumbnailUrl, ContentStatus status) {
        super();
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.category = category;
        this.thumbnailUrl = thumbnailUrl;
        this.status = status != null ? status : ContentStatus.PENDING;
        this.upvotesCount = 0;
        this.viewsCount = 0;
        this.readTimeMinutes = 5;
    }

    // Domain Logic & State Transitions
    public void incrementViews() {
        this.viewsCount = (this.viewsCount == null ? 0 : this.viewsCount) + 1;
    }

    public void incrementUpvotes() {
        this.upvotesCount = (this.upvotesCount == null ? 0 : this.upvotesCount) + 1;
    }

    public void publish() {
        this.status = ContentStatus.APPROVED;
    }

    public void reject() {
        this.status = ContentStatus.REJECTED;
    }

    // Encapsulation: Getters and Setters
    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ContentStatus getStatus() {
        return status;
    }

    public void setStatus(ContentStatus status) {
        this.status = status != null ? status : ContentStatus.PENDING;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Integer getUpvotesCount() {
        return upvotesCount;
    }

    public void setUpvotesCount(Integer upvotesCount) {
        this.upvotesCount = upvotesCount != null ? upvotesCount : 0;
    }

    public Integer getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Integer viewsCount) {
        this.viewsCount = viewsCount != null ? viewsCount : 0;
    }

    public Integer getReadTimeMinutes() {
        return readTimeMinutes;
    }

    public void setReadTimeMinutes(Integer readTimeMinutes) {
        this.readTimeMinutes = readTimeMinutes != null ? readTimeMinutes : 5;
    }
}
