package com.group2.auth_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testAuthResponse() {
        AuthResponse dto = new AuthResponse("token", "refresh", "ROLE_USER", 1L, "user");
        assertEquals("token", dto.getToken());
        assertEquals("refresh", dto.getRefreshToken());
        assertEquals(1L, dto.getId());
        assertEquals("user", dto.getName());
        assertEquals("ROLE_USER", dto.getRole());

        dto.setToken("newT");
        dto.setRefreshToken("newR");
        dto.setId(2L);
        dto.setRole("ROLE_ADMIN");
        dto.setName("admin");
        assertEquals("newT", dto.getToken());
        assertEquals("newR", dto.getRefreshToken());
        assertEquals(2L, dto.getId());
        assertEquals("ROLE_ADMIN", dto.getRole());
        assertEquals("admin", dto.getName());
    }

    @Test
    void testLoginRequest() {
        LoginRequest dto = new LoginRequest();
        dto.setEmail("test@test.com");
        dto.setPassword("pass");
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("pass", dto.getPassword());
    }

    @Test
    void testRegisterRequest() {
        RegisterRequest dto = new RegisterRequest();
        dto.setName("user");
        dto.setEmail("e");
        dto.setPassword("p");
        dto.setPhone("1");
        dto.setAddress("a");
        assertEquals("user", dto.getName());
        assertEquals("e", dto.getEmail());
        assertEquals("p", dto.getPassword());
        assertEquals("1", dto.getPhone());
        assertEquals("a", dto.getAddress());
    }

    @Test
    void testResetPasswordRequest() {
        ResetPasswordRequest dto = new ResetPasswordRequest();
        dto.setToken("t");
        dto.setNewPassword("p");
        assertEquals("t", dto.getToken());
        assertEquals("p", dto.getNewPassword());
    }

    @Test
    void testUpdateProfileRequest() {
        UpdateProfileRequest dto = new UpdateProfileRequest();
        dto.setName("n");
        dto.setPhone("p");
        dto.setAddress("a");
        assertEquals("n", dto.getName());
        assertEquals("p", dto.getPhone());
        assertEquals("a", dto.getAddress());
    }
}
