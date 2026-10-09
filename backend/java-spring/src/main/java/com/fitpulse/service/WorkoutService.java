package com.fitpulse.service;

import com.fitpulse.dto.WorkoutDtos.CalorieEstimateResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutCreateRequest;
import com.fitpulse.dto.WorkoutDtos.WorkoutResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutUpdateRequest;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.repository.WorkoutLogRepository;
import com.fitpulse.strategy.CalorieStrategyFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service implementation for Workout operations.
 * Demonstrates:
 * - OOP Interface Implementation (IWorkoutService).
 * - Full CRUD Lifecycle: Create (logWorkout), Read (getMyWorkouts, getWorkoutById), Update (updateWorkout), Delete (deleteWorkout).
 * - Polymorphic Strategy Dispatch: Uses CalorieStrategyFactory for MET estimations.
 * - Cross-Cutting Audit Logging and Automated Goal Evaluation.
 */
@Service
public class WorkoutService implements IWorkoutService {

    private final WorkoutLogRepository workoutLogRepository;
    private final IAuthService authService;
    private final ChallengeService challengeService;
    private final IGoalService goalService;
    private final IActivityLogService activityLogService;
    private final CalorieStrategyFactory calorieStrategyFactory;

    public WorkoutService(WorkoutLogRepository workoutLogRepository,
                          IAuthService authService,
                          ChallengeService challengeService,
                          IGoalService goalService,
                          IActivityLogService activityLogService,
                          CalorieStrategyFactory calorieStrategyFactory) {
        this.workoutLogRepository = workoutLogRepository;
        this.authService = authService;
        this.challengeService = challengeService;
        this.goalService = goalService;
        this.activityLogService = activityLogService;
        this.calorieStrategyFactory = calorieStrategyFactory;
    }

    @Override
    @Transactional
    public WorkoutResponse logWorkout(WorkoutCreateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();

        LocalDateTime loggedTime = request.getLoggedAt() != null ? request.getLoggedAt() : LocalDateTime.now();

        // Polymorphic calorie calculation fallback if client provides 0
        int calculatedCalories = request.getCaloriesBurned();
        if (calculatedCalories <= 0) {
            calculatedCalories = calorieStrategyFactory.estimateCalories(
                    request.getWorkoutType(),
                    request.getIntensity(),
                    request.getDurationMinutes(),
                    70.0 // Standard athletic weight baseline
            );
        }

        Double volume = request.getVolumeKg() != null ? request.getVolumeKg() : 0.0;

        WorkoutLog log = new WorkoutLog(
                user,
                request.getWorkoutType(),
                request.getDurationMinutes(),
                request.getIntensity(),
                calculatedCalories,
                volume,
                loggedTime,
                request.getNotes()
        );

        WorkoutLog saved = workoutLogRepository.save(log);

        // 1. Automatically increment active challenges
        challengeService.processWorkoutForChallenges(user, saved);

        // 2. Automatically evaluate and increment active goals
        goalService.evaluateGoalsAfterWorkout(user, saved);

        // 3. Record immutable activity audit log
        activityLogService.logActivity(user, ActivityType.WORKOUT_LOGGED,
                String.format("Logged %s session (%d mins, %d kcal, %.1f kg volume)",
                        saved.getWorkoutType(), saved.getDurationMinutes(), saved.getCaloriesBurned(), saved.getVolumeKg()),
                "WORKOUT", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WorkoutResponse> getMyWorkouts(WorkoutType type, Pageable pageable) {
        User user = authService.getCurrentAuthenticatedUser();
        Page<WorkoutLog> page;

        if (type != null) {
            page = workoutLogRepository.findByUserAndWorkoutTypeOrderByLoggedAtDesc(user, type, pageable);
        } else {
            page = workoutLogRepository.findByUserOrderByLoggedAtDesc(user, pageable);
        }

        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkoutResponse getWorkoutById(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout record", id));

        if (!log.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Unauthorized to view another athlete's workout telemetry");
        }

        return mapToResponse(log);
    }

    @Override
    @Transactional
    public WorkoutResponse updateWorkout(Long id, WorkoutUpdateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout record", id));

        // Ownership and RBAC authorization check
        if (!log.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Unauthorized to modify another athlete's workout telemetry");
        }

        boolean modalityOrDurationChanged = false;

        if (request.getWorkoutType() != null) {
            log.setWorkoutType(request.getWorkoutType());
            modalityOrDurationChanged = true;
        }

        if (request.getDurationMinutes() != null) {
            if (request.getDurationMinutes() <= 0) {
                throw new BadRequestException("Duration must be at least 1 minute");
            }
            log.setDurationMinutes(request.getDurationMinutes());
            modalityOrDurationChanged = true;
        }

        if (request.getIntensity() != null) {
            log.setIntensity(request.getIntensity());
            modalityOrDurationChanged = true;
        }

        if (request.getCaloriesBurned() != null && request.getCaloriesBurned() > 0) {
            log.setCaloriesBurned(request.getCaloriesBurned());
        } else if (modalityOrDurationChanged) {
            // Recompute calories dynamically if duration/modality changed and no explicit calories provided
            int recalculated = calorieStrategyFactory.estimateCalories(
                    log.getWorkoutType(),
                    log.getIntensity(),
                    log.getDurationMinutes(),
                    70.0
            );
            log.setCaloriesBurned(recalculated);
        }

        if (request.getVolumeKg() != null) {
            if (request.getVolumeKg() < 0) {
                throw new BadRequestException("Volume load cannot be negative");
            }
            log.setVolumeKg(request.getVolumeKg());
        }

        if (request.getLoggedAt() != null) {
            log.setLoggedAt(request.getLoggedAt());
        }

        if (request.getNotes() != null) {
            log.setNotes(request.getNotes());
        }

        log.setUpdatedAt(LocalDateTime.now());
        WorkoutLog saved = workoutLogRepository.save(log);

        activityLogService.logActivity(user, ActivityType.WORKOUT_UPDATED,
                String.format("Updated %s session #%d (%d mins, %d kcal)",
                        saved.getWorkoutType(), saved.getId(), saved.getDurationMinutes(), saved.getCaloriesBurned()),
                "WORKOUT", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteWorkout(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout record", id));

        if (!log.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Unauthorized to delete another athlete's workout telemetry");
        }

        workoutLogRepository.delete(log);

        activityLogService.logActivity(user, ActivityType.WORKOUT_DELETED,
                "Deleted workout session #" + id, "WORKOUT", id);
    }

    @Override
    public CalorieEstimateResponse estimateCalories(WorkoutType type, Intensity intensity, int durationMinutes, Double weightKg) {
        double weight = weightKg != null && weightKg > 0 ? weightKg : 70.0;
        int estimatedCalories = calorieStrategyFactory.estimateCalories(type, intensity, durationMinutes, weight);
        return new CalorieEstimateResponse(type, intensity, durationMinutes, estimatedCalories);
    }

    private WorkoutResponse mapToResponse(WorkoutLog log) {
        return new WorkoutResponse(
                log.getId(),
                log.getWorkoutType(),
                log.getDurationMinutes(),
                log.getIntensity(),
                log.getCaloriesBurned(),
                log.getVolumeKg(),
                log.getLoggedAt(),
                log.getNotes(),
                log.getUser() != null ? log.getUser().getId() : null,
                log.getUser() != null ? log.getUser().getName() : null
        );
    }
}
