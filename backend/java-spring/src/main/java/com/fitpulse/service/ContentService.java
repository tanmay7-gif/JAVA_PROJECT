package com.fitpulse.service;

import com.fitpulse.dto.ContentDtos.ContentCreateRequest;
import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.repository.FitnessContentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Fitness Content.
 * Implements IContentService.
 */
@Service
public class ContentService implements IContentService {

    private final FitnessContentRepository contentRepository;
    private final IActivityLogService activityLogService;

    public ContentService(FitnessContentRepository contentRepository,
                          IActivityLogService activityLogService) {
        this.contentRepository = contentRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    public ContentResponse submitContent(User creator, ContentCreateRequest request) {
        FitnessContent content = new FitnessContent(
                creator,
                request.getTitle().trim(),
                request.getDescription().trim(),
                request.getCategory().trim(),
                request.getThumbnailUrl(),
                ContentStatus.APPROVED
        );

        FitnessContent saved = contentRepository.save(content);

        activityLogService.logActivity(creator, ActivityType.CONTENT_CREATED,
                "Published educational fitness guide: " + saved.getTitle(), "CONTENT", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContentResponse> getApprovedContent(Pageable pageable) {
        return contentRepository.findByStatusOrderByCreatedAtDesc(ContentStatus.APPROVED, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ContentResponse upvoteContent(Long id) {
        FitnessContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content guide not found: " + id));
        content.setUpvotesCount(content.getUpvotesCount() + 1);
        return mapToResponse(contentRepository.save(content));
    }

    private ContentResponse mapToResponse(FitnessContent content) {
        ContentResponse dto = new ContentResponse();
        dto.setId(content.getId());
        dto.setCreatorName(content.getCreator() != null ? content.getCreator().getName() : "FitPulse Coach");
        dto.setTitle(content.getTitle());
        dto.setDescription(content.getDescription());
        dto.setCategory(content.getCategory());
        dto.setStatus(content.getStatus());
        dto.setThumbnailUrl(content.getThumbnailUrl());
        dto.setUpvotesCount(content.getUpvotesCount());
        dto.setCreatedAt(content.getCreatedAt());
        return dto;
    }
}
