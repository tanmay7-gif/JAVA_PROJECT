package com.fitpulse.service;

import com.fitpulse.dto.GoalDtos.GoalCreateRequest;
import com.fitpulse.dto.GoalDtos.GoalResponse;
import com.fitpulse.dto.GoalDtos.GoalUpdateRequest;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.Goal;
import com.fitpulse.model.User;
import com.fitpulse.model.Workout;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.model.enums.GoalType;
import com.fitpulse.repository.GoalRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of IGoalService.
 * Demonstrates:
 * - OOP Separation of Concerns (Service layer orchestration).
 * - Java Collections: Filtering, stream mapping, and list transformations.
 * - Dynamic domain event propagation: Synchronizes goal progress from logged workouts.
 */
@Service
public class GoalServiceImpl implements IGoalService {

    private final GoalRepository goalRepository;
    private final IAuthService authService;
    private final IActivityLogService activityLogService;

    public GoalServiceImpl(GoalRepository goalRepository,
                           IAuthService authService,
                           IActivityLogService activityLogService) {
        this.goalRepository = goalRepository;
        this.authService = authService;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(GoalCreateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();

        Goal goal = new Goal(
                user,
                request.getTitle().trim(),
                request.getDescription(),
                request.getGoalType(),
                request.getTargetValue(),
                request.getTargetDate()
        );

        Goal saved = goalRepository.save(goal);

        activityLogService.logActivity(user, ActivityType.GOAL_CREATED,
                "Established new fitness milestone: " + saved.getTitle(), "GOAL", saved.getId());

        return GoalResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getMyGoals(GoalStatus status) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Goal> goals;
        if (status != null) {
            goals = goalRepository.findByUserAndStatus(user, status);
        } else {
            goals = goalRepository.findByUserOrderByCreatedAtDesc(user);
        }

        return goals.stream()
                .map(GoalResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalResponse> getMyGoalsPaged(Pageable pageable) {
        User user = authService.getCurrentAuthenticatedUser();
        return goalRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(GoalResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoalById(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        if (!goal.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Access denied to this personal milestone target");
        }

        return GoalResponse.fromEntity(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long id, GoalUpdateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        if (!goal.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Access denied to this personal milestone target");
        }

        goal.setTitle(request.getTitle().trim());
        goal.setDescription(request.getDescription());
        goal.setGoalType(request.getGoalType());
        goal.setTargetValue(request.getTargetValue());
        if (request.getCurrentValue() != null) {
            goal.setCurrentValue(request.getCurrentValue());
        }
        goal.setTargetDate(request.getTargetDate());

        boolean wasAlreadyCompleted = goal.isCompleted();
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
            if (request.getStatus() == GoalStatus.COMPLETED && goal.getCompletedAt() == null) {
                goal.setCompletedAt(java.time.LocalDateTime.now());
            }
        }

        if (goal.getCurrentValue() >= goal.getTargetValue() && goal.getStatus() != GoalStatus.COMPLETED) {
            goal.markAsCompleted();
        }

        Goal saved = goalRepository.save(goal);

        if (!wasAlreadyCompleted && saved.isCompleted()) {
            user.addXp(300);
            activityLogService.logActivity(user, ActivityType.GOAL_COMPLETED,
                    "Achieved fitness milestone: " + saved.getTitle(), "GOAL", saved.getId());
        } else {
            activityLogService.logActivity(user, ActivityType.GOAL_UPDATED,
                    "Updated milestone configurations for: " + saved.getTitle(), "GOAL", saved.getId());
        }

        return GoalResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteGoal(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        if (!goal.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Access denied to this personal milestone target");
        }

        goalRepository.delete(goal);
        activityLogService.logActivity(user, ActivityType.GOAL_DELETED,
                "Removed fitness milestone: " + goal.getTitle(), "GOAL", id);
    }

    @Override
    @Transactional
    public GoalResponse incrementProgress(Long id, Double increment) {
        User user = authService.getCurrentAuthenticatedUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        if (!goal.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Access denied to this personal milestone target");
        }

        boolean wasAlreadyCompleted = goal.isCompleted();
        goal.incrementProgress(increment);
        Goal saved = goalRepository.save(goal);

        if (!wasAlreadyCompleted && saved.isCompleted()) {
            user.addXp(300); // Milestone XP bonus
            activityLogService.logActivity(user, ActivityType.GOAL_COMPLETED,
                    "Successfully reached fitness milestone: " + saved.getTitle(), "GOAL", saved.getId());
        } else {
            activityLogService.logActivity(user, ActivityType.GOAL_PROGRESS_UPDATED,
                    "Updated milestone progress for: " + saved.getTitle(), "GOAL", saved.getId());
        }

        return GoalResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public GoalResponse abandonGoal(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));

        if (!goal.getUser().getId().equals(user.getId()) && !user.getRole().isAdmin()) {
            throw new BadRequestException("Access denied to this personal milestone target");
        }

        goal.abandon();
        Goal saved = goalRepository.save(goal);
        return GoalResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void evaluateGoalsAfterWorkout(User user, Workout workout) {
        if (user == null || workout == null) return;

        List<Goal> activeGoals = goalRepository.findByUserAndStatus(user, GoalStatus.IN_PROGRESS);
        for (Goal goal : activeGoals) {
            Double increment = 0.0;
            GoalType type = goal.getGoalType();

            if (type == GoalType.CALORIE_BURN && workout.getCaloriesBurned() != null) {
                increment = workout.getCaloriesBurned().doubleValue();
            } else if (type == GoalType.WORKOUT_COUNT) {
                increment = 1.0;
            } else if (type == GoalType.DURATION_MINUTES && workout.getDurationMinutes() != null) {
                increment = workout.getDurationMinutes().doubleValue();
            } else if (type == GoalType.VOLUME_KG && workout.getVolumeKg() != null) {
                increment = workout.getVolumeKg();
            }

            if (increment > 0) {
                boolean wasCompleted = goal.isCompleted();
                goal.incrementProgress(increment);
                goalRepository.save(goal);

                if (!wasCompleted && goal.isCompleted()) {
                    user.addXp(300);
                    activityLogService.logActivity(user, ActivityType.GOAL_COMPLETED,
                            "Achieved milestone from workout: " + goal.getTitle(), "GOAL", goal.getId());
                }
            }
        }
    }
}
