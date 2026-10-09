package com.fitpulse.controller;

import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.GoalDtos.GoalCreateRequest;
import com.fitpulse.dto.GoalDtos.GoalProgressUpdateRequest;
import com.fitpulse.dto.GoalDtos.GoalResponse;
import com.fitpulse.dto.GoalDtos.GoalUpdateRequest;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.service.IGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing endpoints for personal fitness goal management.
 * Demonstrates:
 * - Proper Controller → Service separation using IGoalService interface.
 * - HTTP status code conventions and DTO validation (@Valid).
 * - Full CRUD capability (POST, GET, PUT, DELETE).
 * - Generic ApiResponse<T> responses.
 */
@RestController
@RequestMapping({"/api/v1/goals", "/api/goals"})
@Tag(name = "Fitness Goals", description = "Endpoints for creating and tracking athletic milestones")
public class GoalController {

    private final IGoalService goalService;

    public GoalController(IGoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    @Operation(summary = "Create a new personal fitness goal")
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody GoalCreateRequest request) {
        GoalResponse created = goalService.createGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Fitness goal established successfully"));
    }

    @GetMapping
    @Operation(summary = "Retrieve active or completed fitness goals for current athlete")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getMyGoals(
            @RequestParam(required = false) GoalStatus status) {
        List<GoalResponse> goals = goalService.getMyGoals(status);
        return ResponseEntity.ok(ApiResponse.ok(goals));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific goal detail by ID")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(@PathVariable Long id) {
        GoalResponse goal = goalService.getGoalById(id);
        return ResponseEntity.ok(ApiResponse.ok(goal));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing fitness goal target, value, deadline, or status")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalUpdateRequest request) {
        GoalResponse updated = goalService.updateGoal(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Fitness goal updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete a fitness goal")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Fitness goal deleted successfully"));
    }

    @PostMapping("/{id}/increment")
    @Operation(summary = "Increment progress toward a goal target")
    public ResponseEntity<ApiResponse<GoalResponse>> incrementProgress(
            @PathVariable Long id,
            @Valid @RequestBody GoalProgressUpdateRequest request) {
        GoalResponse updated = goalService.incrementProgress(id, request.getIncrement());
        return ResponseEntity.ok(ApiResponse.ok(updated, "Goal progress incremented"));
    }

    @PostMapping("/{id}/abandon")
    @Operation(summary = "Abandon an active goal")
    public ResponseEntity<ApiResponse<GoalResponse>> abandonGoal(@PathVariable Long id) {
        GoalResponse abandoned = goalService.abandonGoal(id);
        return ResponseEntity.ok(ApiResponse.ok(abandoned, "Goal transitioned to abandoned state"));
    }
}
