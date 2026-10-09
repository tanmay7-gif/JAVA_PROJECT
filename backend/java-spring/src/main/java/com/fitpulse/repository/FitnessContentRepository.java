package com.fitpulse.repository;

import com.fitpulse.model.FitnessContent;
import com.fitpulse.model.enums.ContentStatus;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

/**
 * Data access repository for FitnessContent entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface FitnessContentRepository extends BaseRepository<FitnessContent, Long> {
    Page<FitnessContent> findByStatusOrderByCreatedAtDesc(ContentStatus status, Pageable pageable);
    long countByStatus(ContentStatus status);
}
