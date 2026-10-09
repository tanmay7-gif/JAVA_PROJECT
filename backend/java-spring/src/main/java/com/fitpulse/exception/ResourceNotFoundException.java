package com.fitpulse.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested domain entity or resource does not exist.
 * Demonstrates OOP Exception Inheritance.
 */
public class ResourceNotFoundException extends FitPulseException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s with identifier '%s' was not found", resourceName, identifier),
                HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }
}
