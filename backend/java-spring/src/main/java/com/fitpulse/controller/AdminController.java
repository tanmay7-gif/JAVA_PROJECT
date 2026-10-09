package com.fitpulse.controller;

import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.ContentDtos.ContentResponse;
import com.fitpulse.dto.ContentDtos.ModerationRequest;
import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.SystemSetting;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.model.enums.Role;
import com.fitpulse.service.IAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing endpoints for administrator platform governance across 5 pillars:
 * 1. User Management
 * 2. Content Management & Moderation
 * 3. System Configuration & Settings
 * 4. Platform Analytics & Statistics
 * 5. Immutable Audit & Activity Monitoring
 *
 * Strictly enforces RBAC with @PreAuthorize("hasRole('ADMIN')").
 * Non-admin athletes attempting access receive HTTP 403 Forbidden.
 * Unauthenticated requests receive HTTP 401 Unauthorized.
 */
@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administrator Governance & Telemetry", description = "RBAC-restricted endpoints for platform overview, user management, and settings")
public class AdminController {

    private final IAdminService adminService;

    public AdminController(IAdminService adminService) {
        this.adminService = adminService;
    }

    // ==========================================
    // Pillar 1: User Management
    // ==========================================
    @GetMapping("/users")
    @Operation(summary = "Get paginated user directory with search")
    public ResponseEntity<ApiResponse<Page<User>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = adminService.getUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get single user account details by ID")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        User user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Update user role privilege level (USER, ADMIN, COACH)")
    public ResponseEntity<ApiResponse<User>> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.ok(updated, "User role successfully elevated/demoted"));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Toggle user active/suspended account state")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        User updated = adminService.toggleUserActiveStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok(updated, "User account status updated"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Soft-delete / deactivate athlete account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User account successfully deactivated"));
    }

    // ==========================================
    // Pillar 2: Content Management & Moderation
    // ==========================================
    @GetMapping("/content")
    @Operation(summary = "Get all fitness content guides with optional status filter")
    public ResponseEntity<ApiResponse<Page<FitnessContent>>> getAllContent(
            @RequestParam(required = false) ContentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FitnessContent> contentPage = adminService.getAllContent(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(contentPage));
    }

    @PostMapping("/content/{id}/moderate")
    @Operation(summary = "Approve or reject community guide submission")
    public ResponseEntity<ApiResponse<ContentResponse>> moderateContent(
            @PathVariable Long id,
            @Valid @RequestBody ModerationRequest request) {
        ContentResponse response = adminService.moderateContent(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Content status updated"));
    }

    @DeleteMapping("/content/{id}")
    @Operation(summary = "Delete / archive fitness content guide")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable Long id) {
        adminService.deleteContent(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Content guide archived successfully"));
    }

    // ==========================================
    // Pillar 3: System Settings
    // ==========================================
    @GetMapping("/settings")
    @Operation(summary = "Retrieve all global system configuration parameters")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAllSettings() {
        List<SystemSetting> settings = adminService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PostMapping("/settings")
    @Operation(summary = "Calibrate / update global system configuration parameter")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @RequestParam String key,
            @RequestParam String value) {
        SystemSetting setting = adminService.updateSetting(key, value);
        return ResponseEntity.ok(ApiResponse.ok(setting, "System setting calibrated"));
    }

    // ==========================================
    // Pillar 4: Platform Analytics & Statistics
    // ==========================================
    @GetMapping("/dashboard")
    @Operation(summary = "Get administrator platform KPIs and node telemetry")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> kpis = adminService.getAdminKpis();
        return ResponseEntity.ok(ApiResponse.ok(kpis));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get detailed platform statistics and system telemetry")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStatistics() {
        Map<String, Object> stats = adminService.getPlatformStatistics();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    // ==========================================
    // Pillar 5: Immutable Audit & Activity Monitoring
    // ==========================================
    @GetMapping("/activity-logs")
    @Operation(summary = "Inspect comprehensive audit stream of system events (Admin only)")
    public ResponseEntity<ApiResponse<Page<ActivityLog>>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = adminService.getActivityLogs(pageable);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
