package com.group2.payment_service.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {

    @Test
    @DisplayName("Should set and get all Transaction fields correctly")
    void testTransaction_AllFields() {
        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setUserId(1L);
        transaction.setAmount(100.0);
        transaction.setStatus("SUCCESS");

        assertEquals(1L, transaction.getId());
        assertEquals(1L, transaction.getUserId());
        assertEquals(100.0, transaction.getAmount());
        assertEquals("SUCCESS", transaction.getStatus());
    }

    @Test
    @DisplayName("Should set createdAt via prePersist hook")
    void testTransaction_PrePersist() {
        Transaction transaction = new Transaction();
        assertNull(transaction.getCreatedAt());
        transaction.prePersist();
        assertNotNull(transaction.getCreatedAt());
    }

    @Test
    @DisplayName("Should map User fields correctly")
    void testUser_Fields() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        assertEquals(1L, user.getId());
        assertEquals("Test User", user.getName());
    }

    @Test
    @DisplayName("Should map Policy fields correctly")
    void testPolicy_Fields() {
        Policy policy = new Policy();
        policy.setId(1L);
        policy.setPolicyName("Standard Policy");
        assertEquals(1L, policy.getId());
        assertEquals("Standard Policy", policy.getPolicyName());
    }
}
