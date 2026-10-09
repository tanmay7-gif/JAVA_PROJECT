package com.fitpulse.service;

import com.fitpulse.dto.ActivityLogDtos.ActivityLogResponse;
import com.fitpulse.dto.PagedResponse;
import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.repository.ActivityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of IActivityLogService.
 * Demonstrates:
 * - OOP Interface Implementation and Separation of Concerns.
 * - Java Collections: List and Stream API pipelines for DTO transformation.
 * - Generics: PagedResponse<ActivityLogResponse>.
 */
@Service
public class ActivityLogServiceImpl implements IActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogServiceImpl(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional
    public ActivityLog logActivity(Long userId, String email, ActivityType type, String description,
                                   String entityType, Long entityId, String ipAddress) {
        ActivityLog log = ActivityLog.of(userId, email, type, description, entityType, entityId, ipAddress);
        return activityLogRepository.save(log);
    }

    @Override
    @Transactional
    public ActivityLog logActivity(User user, ActivityType type, String description,
                                   String entityType, Long entityId) {
        ActivityLog log = ActivityLog.of(user, type, description, entityType, entityId);
        return activityLogRepository.save(log);
    }

    @Override
    @Transactional
    public ActivityLog logSystemActivity(ActivityType type, String description) {
        ActivityLog log = ActivityLog.system(type, description);
        return activityLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ActivityLogResponse> getAllLogs(Pageable pageable) {
        Page<ActivityLog> page = activityLogRepository.findAllByOrderByTimestampDesc(pageable);
        List<ActivityLogResponse> dtoList = page.getContent().stream()
                .map(ActivityLogResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ActivityLogResponse> getLogsByUser(Long userId, Pageable pageable) {
        Page<ActivityLog> page = activityLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        List<ActivityLogResponse> dtoList = page.getContent().stream()
                .map(ActivityLogResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getRecentLogs() {
        return activityLogRepository.findTop20ByOrderByTimestampDesc().stream()
                .map(ActivityLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
