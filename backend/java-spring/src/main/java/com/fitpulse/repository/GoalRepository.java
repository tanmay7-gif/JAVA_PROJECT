package com.fitpulse.repository;

import com.fitpulse.model.Goal;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.model.enums.GoalType;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access repository for Goal entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface GoalRepository extends BaseRepository<Goal, Long> {

    List<Goal> findByUserOrderByCreatedAtDesc(User user);

    List<Goal> findByUserAndStatus(User user, GoalStatus status);

    List<Goal> findByUserAndGoalTypeAndStatus(User user, GoalType goalType, GoalStatus status);

    Page<Goal> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByUserAndStatus(User user, GoalStatus status);

    long countByUser(User user);
}
