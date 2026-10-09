package com.fitpulse.repository;

import com.fitpulse.model.ActivityLog;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access repository for ActivityLog and audit entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface ActivityLogRepository extends BaseRepository<ActivityLog, Long> {

    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);

    List<ActivityLog> findTop20ByOrderByTimestampDesc();

    Page<ActivityLog> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);

    Page<ActivityLog> findByActivityTypeOrderByTimestampDesc(ActivityType activityType, Pageable pageable);

    long countByActivityType(ActivityType activityType);
}
