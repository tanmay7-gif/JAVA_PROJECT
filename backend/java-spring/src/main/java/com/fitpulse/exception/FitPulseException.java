package com.fitpulse.exception;

import org.springframework.http.HttpStatus;

/**
 * Root domain runtime exception for FitPulse.
 * Demonstrates OOP Abstraction and Exception Inheritance Hierarchy.
 */
public abstract class FitPulseException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final String errorCode;

    public FitPulseException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus != null ? httpStatus : HttpStatus.INTERNAL_SERVER_ERROR;
        this.errorCode = errorCode != null ? errorCode : "INTERNAL_ERROR";
    }

    public FitPulseException(String message, Throwable cause, HttpStatus httpStatus, String errorCode) {
        super(message, cause);
        this.httpStatus = httpStatus != null ? httpStatus : HttpStatus.INTERNAL_SERVER_ERROR;
        this.errorCode = errorCode != null ? errorCode : "INTERNAL_ERROR";
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
