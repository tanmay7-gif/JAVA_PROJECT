package com.fitpulse.repository;

import com.fitpulse.model.SystemSetting;
import com.fitpulse.repository.base.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data access repository for SystemSetting entities.
 * Extends BaseRepository to demonstrate generic repository inheritance.
 */
@Repository
public interface SystemSettingRepository extends BaseRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
}
