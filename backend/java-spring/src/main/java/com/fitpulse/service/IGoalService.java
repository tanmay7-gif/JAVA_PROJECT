package com.fitpulse.service;

import com.fitpulse.dto.GoalDtos.GoalCreateRequest;
import com.fitpulse.dto.GoalDtos.GoalResponse;
import com.fitpulse.model.User;
import com.fitpulse.model.Workout;
import com.fitpulse.model.enums.GoalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface defining business logic for athlete fitness goal tracking.
 * Demonstrates OOP Abstraction and Interface Segregation.
 */
public interface IGoalService {

    GoalResponse createGoal(GoalCreateRequest request);

    List<GoalResponse> getMyGoals(GoalStatus status);

    Page<GoalResponse> getMyGoalsPaged(Pageable pageable);

    GoalResponse getGoalById(Long id);

    GoalResponse incrementProgress(Long id, Double increment);

    GoalResponse updateGoal(Long id, com.fitpulse.dto.GoalDtos.GoalUpdateRequest request);

    void deleteGoal(Long id);

    GoalResponse abandonGoal(Long id);

    /**
     * Automatically evaluates and updates active user goals following a logged workout session.
     */
    void evaluateGoalsAfterWorkout(User user, Workout workout);
}
