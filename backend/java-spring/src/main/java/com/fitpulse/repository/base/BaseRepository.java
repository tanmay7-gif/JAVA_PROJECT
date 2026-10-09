package com.fitpulse.repository.base;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Generic Base Repository extending Spring Data JpaRepository.
 * Demonstrates:
 * - Java Generics: Parameterized over Entity type T and Identifier type ID.
 * - Abstraction: Exposes standardized CRUD, sorting, and pagination contracts.
 *
 * @param <T> entity domain type
 * @param <ID> entity identifier type
 */
@NoRepositoryBean
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {
}
