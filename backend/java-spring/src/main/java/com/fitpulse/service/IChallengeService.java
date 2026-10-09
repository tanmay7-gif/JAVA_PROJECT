package com.fitpulse.service;

import com.fitpulse.dto.ChallengeDtos.ChallengeResponse;
import com.fitpulse.dto.ChallengeDtos.UserChallengeResponse;
import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.ChallengeStatus;

import java.util.List;

/**
 * Service interface defining business logic contracts for community challenge operations.
 * Demonstrates OOP Abstraction and Interface Segregation.
 */
public interface IChallengeService {

    List<ChallengeResponse> getAvailableChallenges(User currentUser);

    UserChallengeResponse joinChallenge(User user, Long challengeId);

    List<UserChallengeResponse> getMyChallenges(User user, ChallengeStatus status);

    List<UserChallengeResponse> getUserChallengeHistory(User user);

    void processWorkoutForChallenges(User user, WorkoutLog workout);

    UserChallengeResponse claimReward(User user, Long challengeId);

    // Admin Operations
    ChallengeResponse createChallenge(com.fitpulse.dto.ChallengeDtos.ChallengeCreateRequest request);

    ChallengeResponse updateChallenge(Long id, com.fitpulse.dto.ChallengeDtos.ChallengeUpdateRequest request);

    void deleteChallenge(Long id);

    com.fitpulse.dto.ChallengeDtos.ChallengeMonitorResponse monitorChallenge(Long id);
}
