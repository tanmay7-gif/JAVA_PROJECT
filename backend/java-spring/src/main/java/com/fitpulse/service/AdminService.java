package com.fitpulse.service;

import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.dto.ContentDtos.ModerationRequest;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.SystemSetting;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.model.enums.Role;
import com.fitpulse.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service implementation for administrative platform governance and telemetry.
 * Implements IAdminService across all 5 administrative pillars:
 * 1. User Management
 * 2. Content Moderation & Management
 * 3. System Configuration & Settings
 * 4. Platform Analytics & Statistics
 * 5. Immutable Audit & Activity Monitoring
 */
@Service
public class AdminService implements IAdminService {

    private final UserRepository userRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final FitnessContentRepository contentRepository;
    private final FitnessChallengeRepository challengeRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final ActivityLogRepository activityLogRepository;
    private final IActivityLogService activityLogService;

    public AdminService(UserRepository userRepository,
                        WorkoutLogRepository workoutLogRepository,
                        FitnessContentRepository contentRepository,
                        FitnessChallengeRepository challengeRepository,
                        SystemSettingRepository systemSettingRepository,
                        ActivityLogRepository activityLogRepository,
                        IActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.contentRepository = contentRepository;
        this.challengeRepository = challengeRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.activityLogRepository = activityLogRepository;
        this.activityLogService = activityLogService;
    }

    // ==========================================
    // Pillar 1: User Management
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public Page<User> getUsers(String query, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    @Override
    @Transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = getUserById(userId);
        Role previousRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        activityLogService.logSystemActivity(ActivityType.ROLE_UPDATED,
                String.format("Modified user #%d role from %s to %s", userId, previousRole, newRole));

        return saved;
    }

    @Override
    @Transactional
    public User toggleUserActiveStatus(Long userId, boolean isActive) {
        User user = getUserById(userId);
        user.setIsActive(isActive);
        User saved = userRepository.save(user);

        activityLogService.logSystemActivity(ActivityType.USER_STATUS_TOGGLED,
                String.format("User #%d status updated to: %s", userId, isActive ? "ACTIVE" : "SUSPENDED"));

        return saved;
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        user.setIsDeleted(true);
        user.setIsActive(false);
        userRepository.save(user);

        activityLogService.logSystemActivity(ActivityType.USER_DELETED,
                String.format("Soft-deleted user account #%d (%s)", userId, user.getEmail()));
    }

    // ==========================================
    // Pillar 2: Content Management
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public Page<FitnessContent> getAllContent(ContentStatus status, Pageable pageable) {
        if (status != null) {
            return contentRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return contentRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public ContentResponse moderateContent(Long contentId, ModerationRequest request) {
        FitnessContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content", contentId));

        content.setStatus(request.getAction());
        FitnessContent saved = contentRepository.save(content);

        activityLogService.logSystemActivity(ActivityType.CONTENT_UPDATED,
                String.format("Moderated content guide #%d to status: %s", contentId, request.getAction()));

        ContentResponse res = new ContentResponse();
        res.setId(saved.getId());
        res.setTitle(saved.getTitle());
        res.setStatus(saved.getStatus());
        return res;
    }

    @Override
    @Transactional
    public void deleteContent(Long contentId) {
        FitnessContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content", contentId));

        content.setStatus(ContentStatus.ARCHIVED);
        content.setIsDeleted(true);
        contentRepository.save(content);

        activityLogService.logSystemActivity(ActivityType.CONTENT_DELETED,
                String.format("Archived content guide #%d (%s)", contentId, content.getTitle()));
    }

    // ==========================================
    // Pillar 3: System Settings
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    @Override
    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElse(new SystemSetting(key, value));
        setting.setSettingValue(value);
        setting.setUpdatedAt(LocalDateTime.now());
        SystemSetting saved = systemSettingRepository.save(setting);

        activityLogService.logSystemActivity(ActivityType.SYSTEM_SETTING_UPDATED,
                "Updated runtime parameter: " + key);

        return saved;
    }

    // ==========================================
    // Pillar 4: Platform Statistics & KPIs
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAdminKpis() {
        Map<String, Object> kpis = new HashMap<>();

        long totalUsers = userRepository.count();
        long workoutsToday = workoutLogRepository.countWorkoutsToday(LocalDate.now().atStartOfDay());
        long pendingApprovals = contentRepository.countByStatus(ContentStatus.PENDING);
        long activeChallenges = challengeRepository.countByEndDateAfter(LocalDateTime.now());

        kpis.put("totalUsers", totalUsers);
        kpis.put("activeWorkoutsToday", workoutsToday);
        kpis.put("pendingContentApprovals", pendingApprovals);
        kpis.put("ongoingChallenges", activeChallenges);

        return kpis;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStatistics() {
        Map<String, Object> stats = new HashMap<>(getAdminKpis());

        long totalWorkouts = workoutLogRepository.count();
        long completedChallenges = challengeRepository.countByStatus(ChallengeStatus.COMPLETED);

        stats.put("totalLifetimeWorkouts", totalWorkouts);
        stats.put("completedChallenges", completedChallenges);
        stats.put("serverStatus", "OPERATIONAL");
        stats.put("jvmFreeMemoryMb", Runtime.getRuntime().freeMemory() / (1024 * 1024));
        stats.put("jvmTotalMemoryMb", Runtime.getRuntime().totalMemory() / (1024 * 1024));
        stats.put("timestamp", LocalDateTime.now().toString());

        return stats;
    }

    // ==========================================
    // Pillar 5: Activity Monitoring
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLog> getActivityLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
