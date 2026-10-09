package com.fitpulse.service;

import com.fitpulse.dto.ActivityLogDtos.ActivityLogResponse;
import com.fitpulse.dto.PagedResponse;
import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ActivityType;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for recording and auditing domain activity events.
 * Demonstrates OOP Abstraction and Generics.
 */
public interface IActivityLogService {
    ActivityLog logActivity(Long userId, String email, ActivityType type, String description,
                            String entityType, Long entityId, String ipAddress);

    ActivityLog logActivity(User user, ActivityType type, String description,
                            String entityType, Long entityId);

    ActivityLog logSystemActivity(ActivityType type, String description);

    PagedResponse<ActivityLogResponse> getAllLogs(Pageable pageable);

    PagedResponse<ActivityLogResponse> getLogsByUser(Long userId, Pageable pageable);

    List<ActivityLogResponse> getRecentLogs();
}
