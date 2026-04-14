package com.group2.auth_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testLoginRequest() {
        LoginRequest dto = new LoginRequest();
        dto.setEmail("test@test.com");
        dto.setPassword("pass");
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("pass", dto.getPassword());
    }

    @Test
    void testAuthResponse() {
        AuthResponse dto = new AuthResponse("token", "refresh", "ROLE_USER", 1L, "Name");
        assertEquals("token", dto.getToken());
        assertEquals("refresh", dto.getRefreshToken());
        assertEquals("ROLE_USER", dto.getRole());
        assertEquals(1L, dto.getId());
        assertEquals("Name", dto.getName());
        
        dto.setToken("t");
        dto.setRefreshToken("r");
        dto.setRole("a");
        dto.setId(2L);
        dto.setName("n");
        
        assertEquals("t", dto.getToken());
        assertEquals("r", dto.getRefreshToken());
        assertEquals("a", dto.getRole());
        assertEquals(2L, dto.getId());
        assertEquals("n", dto.getName());
    }

    @Test
    void testRegisterRequest() {
        RegisterRequest dto = new RegisterRequest();
        dto.setName("Name");
        dto.setEmail("Email");
        dto.setPhone("123");
        dto.setPassword("pass");
        dto.setAddress("Addr");
        
        assertEquals("Name", dto.getName());
        assertEquals("Email", dto.getEmail());
        assertEquals("123", dto.getPhone());
        assertEquals("pass", dto.getPassword());
        assertEquals("Addr", dto.getAddress());
    }

    @Test
    void testResetPasswordRequest() {
        ResetPasswordRequest dto = new ResetPasswordRequest();
        dto.setNewPassword("np");
        assertEquals("np", dto.getNewPassword());
    }

    @Test
    void testTokenRefreshRequest() {
        TokenRefreshRequest dto = new TokenRefreshRequest();
        dto.setRefreshToken("rt");
        assertEquals("rt", dto.getRefreshToken());
    }

    @Test
    void testTokenRefreshResponse() {
        TokenRefreshResponse dto = new TokenRefreshResponse("at", "rt");
        assertEquals("at", dto.getAccessToken());
        assertEquals("rt", dto.getRefreshToken());
        
        dto.setAccessToken("t");
        dto.setRefreshToken("r");
        assertEquals("t", dto.getAccessToken());
        assertEquals("r", dto.getRefreshToken());
    }

    @Test
    void testUpdateProfileRequest() {
        UpdateProfileRequest dto = new UpdateProfileRequest();
        dto.setName("N");
        dto.setPhone("P");
        assertEquals("N", dto.getName());
        assertEquals("P", dto.getPhone());
    }
}
