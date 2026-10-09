package com.fitpulse.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when authentication or bearer token verification fails.
 * Demonstrates OOP Exception Inheritance.
 */
public class UnauthorizedException extends FitPulseException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
