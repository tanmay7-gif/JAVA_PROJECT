package com.fitpulse.controller;

import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.WorkoutDtos.CalorieEstimateResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutCreateRequest;
import com.fitpulse.dto.WorkoutDtos.WorkoutResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutUpdateRequest;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.service.IWorkoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing endpoints for workout telemetry and logging.
 * Injects IWorkoutService interface to enforce Controller → Service separation.
 * Complete CRUD operations:
 * - Create: POST /api/v1/workouts
 * - Read:   GET /api/v1/workouts, GET /api/v1/workouts/{id}, GET /api/v1/workouts/estimate-calories
 * - Update: PUT /api/v1/workouts/{id}
 * - Delete: DELETE /api/v1/workouts/{id}
 */
@RestController
@RequestMapping({"/api/v1/workouts", "/api/workouts"})
@Tag(name = "Workouts & Conditioning", description = "Endpoints for logging and auditing training sessions")
public class WorkoutController {

    private final IWorkoutService workoutService;

    public WorkoutController(IWorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    @Operation(summary = "Log new conditioning or hypertrophy session")
    public ResponseEntity<ApiResponse<WorkoutResponse>> logWorkout(@Valid @RequestBody WorkoutCreateRequest request) {
        WorkoutResponse response = workoutService.logWorkout(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Workout logged, goals evaluated, and challenges incremented"));
    }

    @GetMapping
    @Operation(summary = "Get paginated workout history with optional discipline filter")
    public ResponseEntity<ApiResponse<Page<WorkoutResponse>>> getMyWorkouts(
            @RequestParam(required = false) WorkoutType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WorkoutResponse> result = workoutService.getMyWorkouts(type, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific workout session details by ID")
    public ResponseEntity<ApiResponse<WorkoutResponse>> getWorkoutById(@PathVariable Long id) {
        WorkoutResponse response = workoutService.getWorkoutById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update existing workout session telemetry")
    public ResponseEntity<ApiResponse<WorkoutResponse>> updateWorkout(
            @PathVariable Long id,
            @Valid @RequestBody WorkoutUpdateRequest request) {
        WorkoutResponse response = workoutService.updateWorkout(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Workout telemetry updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete workout session log")
    public ResponseEntity<ApiResponse<Void>> deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Workout log deleted successfully"));
    }

    @GetMapping("/estimate-calories")
    @Operation(summary = "Compute polymorphic MET calorie estimation")
    public ResponseEntity<ApiResponse<CalorieEstimateResponse>> estimateCalories(
            @RequestParam WorkoutType type,
            @RequestParam(defaultValue = "MEDIUM") Intensity intensity,
            @RequestParam(defaultValue = "45") int duration,
            @RequestParam(required = false) Double weight) {
        CalorieEstimateResponse estimate = workoutService.estimateCalories(type, intensity, duration, weight);
        return ResponseEntity.ok(ApiResponse.ok(estimate));
    }
}
