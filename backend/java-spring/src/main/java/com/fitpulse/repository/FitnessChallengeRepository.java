package com.fitpulse.repository;

import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data access repository for FitnessChallenge entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface FitnessChallengeRepository extends BaseRepository<FitnessChallenge, Long> {
    List<FitnessChallenge> findByEndDateAfterOrderByStartDateAsc(LocalDateTime now);
    List<FitnessChallenge> findAllByOrderByStartDateDesc();
    long countByEndDateAfter(LocalDateTime now);
}
