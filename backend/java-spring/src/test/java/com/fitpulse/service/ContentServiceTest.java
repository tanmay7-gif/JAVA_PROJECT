package com.fitpulse.service;

import com.fitpulse.dto.ContentDtos.ContentCreateRequest;
import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.model.enums.Role;
import com.fitpulse.repository.FitnessContentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentServiceTest {

    @Mock
    private FitnessContentRepository contentRepository;

    @Mock
    private IActivityLogService activityLogService;

    @InjectMocks
    private ContentService contentService;

    private User testAuthor;
    private FitnessContent testContent;

    @BeforeEach
    void setUp() {
        testAuthor = new User("Marcus Vance", "marcus@fitpulse.com", "hash", Role.ADMIN, "avatar.png");
        testAuthor.setId(1L);

        testContent = new FitnessContent(
                testAuthor,
                "Hypertrophy Fundamentals",
                "Progressive overload protocol",
                "Strength",
                "thumbnail.png",
                ContentStatus.APPROVED
        );
        testContent.setId(50L);
    }

    @Test
    @DisplayName("Should successfully submit new fitness content guide")
    void testSubmitContent_Success() {
        ContentCreateRequest request = new ContentCreateRequest();
        request.setTitle("Hypertrophy Fundamentals");
        request.setDescription("Progressive overload protocol");
        request.setCategory("Strength");
        request.setThumbnailUrl("thumbnail.png");

        when(contentRepository.save(any(FitnessContent.class))).thenReturn(testContent);

        ContentResponse response = contentService.submitContent(testAuthor, request);

        assertNotNull(response);
        assertEquals("Hypertrophy Fundamentals", response.getTitle());
        assertEquals("Strength", response.getCategory());
        assertEquals(ContentStatus.APPROVED, response.getStatus());
        verify(contentRepository, times(1)).save(any(FitnessContent.class));
    }

    @Test
    @DisplayName("Should retrieve paginated list of approved content")
    void testGetApprovedContent_Success() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<FitnessContent> page = new PageImpl<>(Collections.singletonList(testContent));

        when(contentRepository.findByStatusOrderByCreatedAtDesc(ContentStatus.APPROVED, pageRequest))
                .thenReturn(page);

        Page<ContentResponse> result = contentService.getApprovedContent(pageRequest);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Hypertrophy Fundamentals", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("Should increment upvote count on existing content")
    void testUpvoteContent_Success() {
        when(contentRepository.findById(50L)).thenReturn(Optional.of(testContent));
        when(contentRepository.save(any(FitnessContent.class))).thenReturn(testContent);

        ContentResponse response = contentService.upvoteContent(50L);

        assertNotNull(response);
        assertEquals(1, testContent.getUpvotesCount());
        verify(contentRepository, times(1)).save(testContent);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when upvoting non-existent content")
    void testUpvoteContent_NotFound_ThrowsException() {
        when(contentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contentService.upvoteContent(999L));
        verify(contentRepository, never()).save(any(FitnessContent.class));
    }
}
