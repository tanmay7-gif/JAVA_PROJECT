package com.fitpulse.service;

import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.dto.ContentDtos.ModerationRequest;
import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.SystemSetting;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.model.enums.Role;
import com.fitpulse.repository.*;
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
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WorkoutLogRepository workoutLogRepository;

    @Mock
    private FitnessContentRepository contentRepository;

    @Mock
    private FitnessChallengeRepository challengeRepository;

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private IActivityLogService activityLogService;

    @InjectMocks
    private AdminService adminService;

    private User sampleUser;
    private FitnessContent sampleContent;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Athlete One", "athlete@fitpulse.com", "hash", Role.USER, "avatar.png");
        sampleUser.setId(10L);

        sampleContent = new FitnessContent();
        sampleContent.setId(20L);
        sampleContent.setTitle("Bench Press 101");
        sampleContent.setStatus(ContentStatus.PENDING);
    }

    @Test
    @DisplayName("Pillar 1: getUserById returns user when found")
    void testGetUserById_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));

        User user = adminService.getUserById(10L);

        assertNotNull(user);
        assertEquals(10L, user.getId());
        assertEquals("Athlete One", user.getName());
    }

    @Test
    @DisplayName("Pillar 1: updateUserRole elevates/demotes user role and records audit event")
    void testUpdateUserRole_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = adminService.updateUserRole(10L, Role.ADMIN);

        assertNotNull(updated);
        assertEquals(Role.ADMIN, updated.getRole());
        verify(activityLogService).logSystemActivity(eq(com.fitpulse.model.enums.ActivityType.ROLE_UPDATED), anyString());
    }

    @Test
    @DisplayName("Pillar 1: deleteUser soft-deletes athlete account and logs audit event")
    void testDeleteUser_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        adminService.deleteUser(10L);

        assertTrue(sampleUser.getIsDeleted());
        assertFalse(sampleUser.getIsActive());
        verify(activityLogService).logSystemActivity(eq(com.fitpulse.model.enums.ActivityType.USER_DELETED), anyString());
    }

    @Test
    @DisplayName("Pillar 2: getAllContent retrieves content page with status filter")
    void testGetAllContent_WithStatusFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        when(contentRepository.findByStatusOrderByCreatedAtDesc(ContentStatus.PENDING, pageable))
                .thenReturn(new PageImpl<>(List.of(sampleContent)));

        Page<FitnessContent> page = adminService.getAllContent(ContentStatus.PENDING, pageable);

        assertEquals(1, page.getTotalElements());
        assertEquals(ContentStatus.PENDING, page.getContent().get(0).getStatus());
    }

    @Test
    @DisplayName("Pillar 2: moderateContent approves/rejects content and logs audit event")
    void testModerateContent_Success() {
        when(contentRepository.findById(20L)).thenReturn(Optional.of(sampleContent));
        when(contentRepository.save(any(FitnessContent.class))).thenAnswer(i -> i.getArgument(0));

        ModerationRequest req = new ModerationRequest();
        req.setAction(ContentStatus.APPROVED);

        ContentResponse res = adminService.moderateContent(20L, req);

        assertNotNull(res);
        assertEquals(ContentStatus.APPROVED, res.getStatus());
        verify(activityLogService).logSystemActivity(eq(com.fitpulse.model.enums.ActivityType.CONTENT_UPDATED), anyString());
    }

    @Test
    @DisplayName("Pillar 3: getAllSettings retrieves system settings list")
    void testGetAllSettings() {
        SystemSetting setting = new SystemSetting("PLATFORM_NAME", "FitPulse Enterprise");
        when(systemSettingRepository.findAll()).thenReturn(List.of(setting));

        List<SystemSetting> settings = adminService.getAllSettings();

        assertEquals(1, settings.size());
        assertEquals("PLATFORM_NAME", settings.get(0).getSettingKey());
    }

    @Test
    @DisplayName("Pillar 3: updateSetting creates or calibrates system setting")
    void testUpdateSetting_Success() {
        SystemSetting existing = new SystemSetting("MAINTENANCE_MODE", "false");
        when(systemSettingRepository.findBySettingKey("MAINTENANCE_MODE")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(any(SystemSetting.class))).thenAnswer(i -> i.getArgument(0));

        SystemSetting updated = adminService.updateSetting("MAINTENANCE_MODE", "true");

        assertEquals("true", updated.getSettingValue());
        verify(activityLogService).logSystemActivity(eq(com.fitpulse.model.enums.ActivityType.SYSTEM_SETTING_UPDATED), anyString());
    }

    @Test
    @DisplayName("Pillar 4: getPlatformStatistics returns full platform telemetry")
    void testGetPlatformStatistics() {
        when(userRepository.count()).thenReturn(150L);
        when(workoutLogRepository.countWorkoutsToday(any())).thenReturn(25L);
        when(contentRepository.countByStatus(ContentStatus.PENDING)).thenReturn(3L);
        when(challengeRepository.countByEndDateAfter(any(LocalDateTime.class))).thenReturn(5L);
        when(workoutLogRepository.count()).thenReturn(1200L);
        when(challengeRepository.countByStatus(com.fitpulse.model.enums.ChallengeStatus.COMPLETED)).thenReturn(40L);

        Map<String, Object> stats = adminService.getPlatformStatistics();

        assertNotNull(stats);
        assertEquals(150L, stats.get("totalUsers"));
        assertEquals(25L, stats.get("activeWorkoutsToday"));
        assertEquals(1200L, stats.get("totalLifetimeWorkouts"));
        assertEquals("OPERATIONAL", stats.get("serverStatus"));
    }

    @Test
    @DisplayName("Pillar 5: getActivityLogs returns paginated audit events")
    void testGetActivityLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        ActivityLog log = new ActivityLog();
        log.setId(1L);
        log.setDescription("User login");
        when(activityLogRepository.findAllByOrderByTimestampDesc(pageable))
                .thenReturn(new PageImpl<>(List.of(log)));

        Page<ActivityLog> page = adminService.getActivityLogs(pageable);

        assertEquals(1, page.getTotalElements());
    }
}
