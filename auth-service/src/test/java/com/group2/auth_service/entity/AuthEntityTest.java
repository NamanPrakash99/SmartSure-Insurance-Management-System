package com.group2.auth_service.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class AuthEntityTest {

    @Test
    public void testUserEntity() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setPassword("pass");
        user.setName("Name");
        user.setRole(Role.CUSTOMER);
        user.setPhone("1234567890");
        user.setAddress("Street");

        assertEquals(1L, user.getId());
        assertEquals("test@test.com", user.getEmail());
        assertEquals("pass", user.getPassword());
        assertEquals("Name", user.getName());
        assertEquals(Role.CUSTOMER, user.getRole());
        assertEquals("1234567890", user.getPhone());
        assertEquals("Street", user.getAddress());
    }

    @Test
    public void testOtpEntity() {
        Otp otp = new Otp();
        otp.setId(1L);
        otp.setEmail("test@test.com");
        otp.setOtp("123456");
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        assertEquals(1L, otp.getId());
        assertEquals("test@test.com", otp.getEmail());
        assertEquals("123456", otp.getOtp());
        assertNotNull(otp.getExpiryTime());
    }

    @Test
    public void testRefreshTokenEntity() {
        RefreshToken token = new RefreshToken();
        token.setId(1L);
        User user = new User();
        token.setUser(user);
        token.setToken("refresh");
        token.setExpiryDate(Instant.now().plusSeconds(3600));

        assertEquals(1L, token.getId());
        assertEquals(user, token.getUser());
        assertEquals("refresh", token.getToken());
        assertNotNull(token.getExpiryDate());
    }

    @Test
    public void testPasswordResetTokenEntity() {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(1L);
        token.setToken("token");
        User user = new User();
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(1));

        assertEquals(1L, token.getId());
        assertEquals("token", token.getToken());
        assertEquals(user, token.getUser());
        assertNotNull(token.getExpiryDate());
    }
}
