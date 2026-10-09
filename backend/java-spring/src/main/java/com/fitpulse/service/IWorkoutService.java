package com.fitpulse.service;

import com.fitpulse.dto.WorkoutDtos.CalorieEstimateResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutCreateRequest;
import com.fitpulse.dto.WorkoutDtos.WorkoutResponse;
import com.fitpulse.dto.WorkoutDtos.WorkoutUpdateRequest;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface defining business logic contracts for workout management.
 * Demonstrates OOP Abstraction and Interface Segregation covering full CRUD operations:
 * - Create: logWorkout
 * - Read: getMyWorkouts, getWorkoutById, estimateCalories
 * - Update: updateWorkout
 * - Delete: deleteWorkout
 */
public interface IWorkoutService {

    WorkoutResponse logWorkout(WorkoutCreateRequest request);

    Page<WorkoutResponse> getMyWorkouts(WorkoutType type, Pageable pageable);

    WorkoutResponse getWorkoutById(Long id);

    WorkoutResponse updateWorkout(Long id, WorkoutUpdateRequest request);

    void deleteWorkout(Long id);

    CalorieEstimateResponse estimateCalories(WorkoutType type, Intensity intensity, int durationMinutes, Double weightKg);
}
