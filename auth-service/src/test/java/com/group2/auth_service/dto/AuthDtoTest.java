package com.group2.auth_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AuthDtoTest {

    @Test
    public void testAuthResponse() {
        AuthResponse response = new AuthResponse("token", "refresh", "CUSTOMER", 1L, "Name");
        
        assertEquals("token", response.getToken());
        assertEquals("refresh", response.getRefreshToken());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals(1L, response.getId());
        assertEquals("Name", response.getName());
        
        response.setName("New");
        assertEquals("New", response.getName());
    }

    @Test
    public void testLoginRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("pass");

        assertEquals("test@test.com", request.getEmail());
        assertEquals("pass", request.getPassword());
    }

    @Test
    public void testRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("pass");
        request.setName("Name");

        assertEquals("test@test.com", request.getEmail());
        assertEquals("pass", request.getPassword());
        assertEquals("Name", request.getName());
    }

    @Test
    public void testResetPasswordRequest() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("token");
        request.setNewPassword("new");

        assertEquals("token", request.getToken());
        assertEquals("new", request.getNewPassword());
    }

    @Test
    public void testTokenRefreshRequest() {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("refresh");

        assertEquals("refresh", request.getRefreshToken());
    }

    @Test
    public void testTokenRefreshResponse() {
        TokenRefreshResponse response = new TokenRefreshResponse("access", "refresh");
        
        assertEquals("access", response.getAccessToken());
        assertEquals("refresh", response.getRefreshToken());
        
        response.setAccessToken("newAccess");
        assertEquals("newAccess", response.getAccessToken());
    }
}
