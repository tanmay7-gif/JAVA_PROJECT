package com.fitpulse.model.base;

import java.time.LocalDateTime;

/**
 * Interface representing domain entities that record creation and update temporal metadata.
 */
public interface Auditable {
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
}
