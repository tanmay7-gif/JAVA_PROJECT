package com.fitpulse.controller;

import com.fitpulse.dto.ActivityLogDtos.ActivityLogResponse;
import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.PagedResponse;
import com.fitpulse.service.IActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing endpoints for activity audit log streams.
 * Demonstrates Controller → Service separation and RBAC security annotations.
 */
@RestController
@RequestMapping("/api/activity-logs")
@Tag(name = "Activity & Audit Logs", description = "Endpoints for inspecting system and athlete event trails")
public class ActivityLogController {

    private final IActivityLogService activityLogService;

    public ActivityLogController(IActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Retrieve paginated system activity and audit stream (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<ActivityLogResponse>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ActivityLogResponse> result = activityLogService.getAllLogs(pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/recent")
    @Operation(summary = "Retrieve top 20 recent activity events for platform telemetry")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getRecentLogs() {
        List<ActivityLogResponse> recent = activityLogService.getRecentLogs();
        return ResponseEntity.ok(ApiResponse.ok(recent));
    }
}
