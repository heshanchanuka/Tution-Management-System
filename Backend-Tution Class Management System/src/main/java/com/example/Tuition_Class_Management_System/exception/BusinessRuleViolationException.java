package com.example.Tuition_Class_Management_System.exception;

/**
 * A request is well-formed but breaks a domain rule (class at capacity,
 * deleting a teacher who still has classes, etc). Mapped to 409 Conflict.
 */
public class BusinessRuleViolationException extends RuntimeException {
    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
