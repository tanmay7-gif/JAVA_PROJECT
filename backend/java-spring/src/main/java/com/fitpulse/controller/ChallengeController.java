package com.fitpulse.controller;

import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.ChallengeDtos.ChallengeCreateRequest;
import com.fitpulse.dto.ChallengeDtos.ChallengeMonitorResponse;
import com.fitpulse.dto.ChallengeDtos.ChallengeResponse;
import com.fitpulse.dto.ChallengeDtos.ChallengeUpdateRequest;
import com.fitpulse.dto.ChallengeDtos.UserChallengeResponse;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.service.IAuthService;
import com.fitpulse.service.IChallengeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing endpoints for challenge enrollment and gamification.
 * Injects IChallengeService and IAuthService interfaces.
 */
@RestController
@RequestMapping({"/api/v1/challenges", "/api/challenges"})
@Tag(name = "Challenges & Holographic Badges", description = "Endpoints for challenge enrollment and medal tracking")
public class ChallengeController {

    private final IChallengeService challengeService;
    private final IAuthService authService;

    public ChallengeController(IChallengeService challengeService, IAuthService authService) {
        this.challengeService = challengeService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "List all available challenges")
    public ResponseEntity<ApiResponse<List<ChallengeResponse>>> getChallenges() {
        User user = null;
        try {
            user = authService.getCurrentAuthenticatedUser();
        } catch (Exception ignored) {}

        List<ChallengeResponse> list = challengeService.getAvailableChallenges(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Enroll current athlete into an active challenge")
    public ResponseEntity<ApiResponse<UserChallengeResponse>> joinChallenge(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        UserChallengeResponse response = challengeService.joinChallenge(user, id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Enrolled in challenge successfully"));
    }

    @PostMapping("/{id}/enroll")
    @Operation(summary = "Enroll alias for API consistency")
    public ResponseEntity<ApiResponse<UserChallengeResponse>> enrollChallenge(@PathVariable Long id) {
        return joinChallenge(id);
    }

    @PostMapping("/{id}/claim")
    @Operation(summary = "Claim XP and badge rewards for a completed challenge")
    public ResponseEntity<ApiResponse<UserChallengeResponse>> claimReward(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        UserChallengeResponse response = challengeService.claimReward(user, id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Challenge reward claimed and XP credited"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current athlete's active or completed challenges")
    public ResponseEntity<ApiResponse<List<UserChallengeResponse>>> getMyChallenges(
            @RequestParam(required = false) ChallengeStatus status) {
        User user = authService.getCurrentAuthenticatedUser();
        List<UserChallengeResponse> list = challengeService.getMyChallenges(user, status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping({"/my/history", "/history"})
    @Operation(summary = "Get complete historical record of all enrolled challenges for current athlete")
    public ResponseEntity<ApiResponse<List<UserChallengeResponse>>> getChallengeHistory() {
        User user = authService.getCurrentAuthenticatedUser();
        List<UserChallengeResponse> list = challengeService.getUserChallengeHistory(user);
        return ResponseEntity.ok(ApiResponse.ok(list, "Challenge participation history retrieved"));
    }

    // ==========================================
    // ADMIN OPERATIONS
    // ==========================================

    @PostMapping({"/admin", "/admin/create"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new community endurance or fitness challenge (Admin only)")
    public ResponseEntity<ApiResponse<ChallengeResponse>> createChallengeAdmin(
            @Valid @RequestBody ChallengeCreateRequest request) {
        ChallengeResponse created = challengeService.createChallenge(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Fitness challenge successfully published"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new community challenge (Admin standard REST mapping)")
    public ResponseEntity<ApiResponse<ChallengeResponse>> createChallenge(
            @Valid @RequestBody ChallengeCreateRequest request) {
        return createChallengeAdmin(request);
    }

    @PutMapping({"/admin/{id}", "/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update challenge details, milestones, or metrics (Admin only)")
    public ResponseEntity<ApiResponse<ChallengeResponse>> updateChallenge(
            @PathVariable Long id,
            @Valid @RequestBody ChallengeUpdateRequest request) {
        ChallengeResponse updated = challengeService.updateChallenge(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Challenge configuration updated successfully"));
    }

    @DeleteMapping({"/admin/{id}", "/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete challenge and purge enrollments (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteChallenge(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Challenge removed successfully"));
    }

    @GetMapping({"/admin/{id}/monitor", "/{id}/monitor"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Monitor challenge participation, completion rates, and roster (Admin only)")
    public ResponseEntity<ApiResponse<ChallengeMonitorResponse>> monitorChallenge(@PathVariable Long id) {
        ChallengeMonitorResponse monitor = challengeService.monitorChallenge(id);
        return ResponseEntity.ok(ApiResponse.ok(monitor, "Challenge monitoring telemetry retrieved"));
    }
}
