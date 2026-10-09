package com.fitpulse.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when attempting to create an entity with conflicting unique attributes (e.g. email).
 * Demonstrates OOP Exception Inheritance.
 */
public class DuplicateResourceException extends FitPulseException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }

    public DuplicateResourceException(String resourceName, String field, Object value) {
        super(String.format("%s with %s '%s' already exists", resourceName, field, value),
                HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }
}
