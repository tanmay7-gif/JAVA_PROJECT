package com.fitpulse.service;

import com.fitpulse.dto.ContentDtos.ContentCreateRequest;
import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface defining educational workout and video content operations.
 * Demonstrates OOP Abstraction and Interface Segregation.
 */
public interface IContentService {
    ContentResponse submitContent(User creator, ContentCreateRequest request);
    Page<ContentResponse> getApprovedContent(Pageable pageable);
    ContentResponse upvoteContent(Long id);
}
