package com.fitpulse.model.base;

/**
 * Generic interface representing any domain model that has a unique identifier.
 * Demonstrates Java Generics and Abstraction.
 *
 * @param <ID> the type of the identifier
 */
public interface Identifiable<ID> {
    ID getId();
}
