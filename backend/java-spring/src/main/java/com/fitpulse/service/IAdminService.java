package com.fitpulse.service;

import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.dto.ContentDtos.ModerationRequest;
import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.SystemSetting;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Service interface defining administrative governance and platform telemetry contracts.
 * Demonstrates OOP Abstraction and Interface Segregation across 5 core administrative pillars:
 * 1. User Management
 * 2. Content Moderation & Management
 * 3. System Configuration & Settings
 * 4. Platform Analytics & Statistics
 * 5. Immutable Audit & Activity Monitoring
 */
public interface IAdminService {

    // Pillar 1: User Management
    Page<User> getUsers(String query, Pageable pageable);
    User getUserById(Long userId);
    User updateUserRole(Long userId, Role newRole);
    User toggleUserActiveStatus(Long userId, boolean isActive);
    void deleteUser(Long userId);

    // Pillar 2: Content Management
    Page<FitnessContent> getAllContent(ContentStatus status, Pageable pageable);
    ContentResponse moderateContent(Long contentId, ModerationRequest request);
    void deleteContent(Long contentId);

    // Pillar 3: System Settings
    List<SystemSetting> getAllSettings();
    SystemSetting updateSetting(String key, String value);

    // Pillar 4: Platform Statistics & KPIs
    Map<String, Object> getAdminKpis();
    Map<String, Object> getPlatformStatistics();

    // Pillar 5: Activity Monitoring
    Page<ActivityLog> getActivityLogs(Pageable pageable);
}
