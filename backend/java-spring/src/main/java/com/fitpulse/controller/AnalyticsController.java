package com.fitpulse.controller;

import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.WorkoutDtos.AnalyticsSummaryDto;
import com.fitpulse.model.User;
import com.fitpulse.service.IAnalyticsService;
import com.fitpulse.service.IAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing endpoints for biometric and workout telemetry calculations.
 * Injects IAnalyticsService and IAuthService interfaces.
 */
@RestController
@RequestMapping({"/api/v1/analytics", "/api/analytics"})
@Tag(name = "Analytics & Biometric Telemetry", description = "Endpoints serving chart datasets and metabolic velocity calculations")
public class AnalyticsController {

    private final IAnalyticsService analyticsService;
    private final IAuthService authService;

    public AnalyticsController(IAnalyticsService analyticsService, IAuthService authService) {
        this.analyticsService = analyticsService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get rolling 7-day performance volume chart points, category distribution breakdown, and weekly KPIs")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getAnalytics() {
        User user = authService.getCurrentAuthenticatedUser();
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsForUser(user);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
