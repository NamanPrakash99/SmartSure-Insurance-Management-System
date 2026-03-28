package com.group2.claims_service.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.junit.jupiter.api.Assertions.*;

public class ClaimExceptionTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    public void testHandleClaimNotFound() {
        ClaimNotFoundException ex = new ClaimNotFoundException("Claim not found");
        ResponseEntity<String> response = handler.handleClaimNotFound(ex);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Claim not found", response.getBody());
    }

    @Test
    public void testHandleRuntimeException() {
        RuntimeException ex = new RuntimeException("Error");
        ResponseEntity<String> response = handler.handleRuntimeException(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error", response.getBody());
    }

    @Test
    public void testClaimNotFoundExceptionMessage() {
        ClaimNotFoundException ex = new ClaimNotFoundException("Custom msg");
        assertEquals("Custom msg", ex.getMessage());
    }
}
