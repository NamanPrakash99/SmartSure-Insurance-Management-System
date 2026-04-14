package com.group2.auth_service.entity;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {

    @Test
    void testUserEntity() {
        User user = new User();
        user.setId(1L);
        user.setName("User");
        user.setEmail("e@e.com");
        user.setPassword("p");
        user.setRole(Role.CUSTOMER);

        assertEquals(1L, user.getId());
        assertEquals("User", user.getName());
        assertEquals("e@e.com", user.getEmail());
        assertEquals("p", user.getPassword());
        assertEquals(Role.CUSTOMER, user.getRole());
    }

    @Test
    void testRefreshToken() {
        RefreshToken token = new RefreshToken();
        token.setId(1L);
        token.setToken("t");
        token.setExpiryDate(Instant.now());
        token.setUser(new User());

        assertEquals(1L, token.getId());
        assertEquals("t", token.getToken());
        assertNotNull(token.getExpiryDate());
        assertNotNull(token.getUser());
    }
}
