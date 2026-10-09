package com.fitpulse.service;

import com.fitpulse.dto.WorkoutDtos.AnalyticsSummaryDto;
import com.fitpulse.model.User;

/**
 * Service interface defining biometric analytics and telemetry computation contracts.
 * Demonstrates OOP Abstraction and Interface Segregation.
 */
public interface IAnalyticsService {
    AnalyticsSummaryDto getAnalyticsForUser(User user);
}
