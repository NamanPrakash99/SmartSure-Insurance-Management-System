package com.group2.auth_service.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.junit.jupiter.api.Assertions.*;

public class AuthExceptionTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    public void testHandleUserAlreadyExistsException() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("Already exists");
        ResponseEntity<String> response = handler.handleUserAlreadyExistsException(ex);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Already exists", response.getBody());
    }

    @Test
    public void testHandleOtpException() {
        OtpException ex = new OtpException("Invalid OTP");
        ResponseEntity<String> response = handler.handleOtpException(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid OTP", response.getBody());
    }

    @Test
    public void testHandleRuntimeException() {
        RuntimeException ex = new RuntimeException("Something failed");
        ResponseEntity<String> response = handler.handleRuntimeException(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Something failed", response.getBody());
    }

    @Test
    public void testOtpExceptionMessage() {
        OtpException ex = new OtpException("OTP expired");
        assertEquals("OTP expired", ex.getMessage());
    }

    @Test
    public void testUserAlreadyExistsExceptionMessage() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("Exists");
        assertEquals("Exists", ex.getMessage());
    }
}
