package com.fitpulse.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when client request parameters violate domain constraints.
 * Demonstrates OOP Exception Inheritance.
 */
public class BadRequestException extends FitPulseException {

    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }

    public BadRequestException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }
}
