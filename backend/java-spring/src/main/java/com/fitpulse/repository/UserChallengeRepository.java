package com.fitpulse.repository;

import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.User;
import com.fitpulse.model.UserChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access repository for UserChallenge entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface UserChallengeRepository extends BaseRepository<UserChallenge, Long> {
    List<UserChallenge> findByUser(User user);
    List<UserChallenge> findByUserAndStatus(User user, ChallengeStatus status);
    Optional<UserChallenge> findByUserAndChallenge(User user, FitnessChallenge challenge);
    long countByUserAndStatus(User user, ChallengeStatus status);
    List<UserChallenge> findByChallenge(FitnessChallenge challenge);
    long countByChallenge(FitnessChallenge challenge);
    long countByChallengeAndStatus(FitnessChallenge challenge, ChallengeStatus status);
    void deleteByChallenge(FitnessChallenge challenge);
}
