package com.group2.payment_service.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class EntityTest {

    @Test
    @DisplayName("Should set and get all Transaction fields correctly")
    public void testTransaction_AllFields() {
        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setUserId(1L);
        transaction.setPolicyId(1L);
        transaction.setUserPolicyId(1L);
        transaction.setAmount(100.0);
        transaction.setStatus("SUCCESS");
        transaction.setRazorpayOrderId("order_1");
        transaction.setRazorpayPaymentId("pay_1");
        transaction.setRazorpaySignature("sig_1");

        assertEquals(1L, transaction.getId());
        assertEquals(1L, transaction.getUserId());
        assertEquals(1L, transaction.getPolicyId());
        assertEquals(1L, transaction.getUserPolicyId());
        assertEquals(100.0, transaction.getAmount());
        assertEquals("SUCCESS", transaction.getStatus());
        assertEquals("order_1", transaction.getRazorpayOrderId());
        assertEquals("pay_1", transaction.getRazorpayPaymentId());
        assertEquals("sig_1", transaction.getRazorpaySignature());
    }

    @Test
    @DisplayName("Should set and get createdAt for Transaction")
    public void testTransaction_CreatedAt() {
        Transaction transaction = new Transaction();
        LocalDateTime now = LocalDateTime.now();
        transaction.setCreatedAt(now);
        assertEquals(now, transaction.getCreatedAt());
    }

    @Test
    @DisplayName("Should set createdAt via prePersist lifecycle hook")
    public void testTransaction_PrePersist() {
        Transaction transaction = new Transaction();
        assertNull(transaction.getCreatedAt());

        transaction.prePersist();

        assertNotNull(transaction.getCreatedAt());
        assertTrue(transaction.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    @DisplayName("Should produce non-null toString for Transaction")
    public void testTransaction_ToString() {
        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setRazorpayOrderId("order_1");
        transaction.setStatus("PENDING");

        String result = transaction.toString();
        assertNotNull(result);
        assertTrue(result.contains("order_1"));
        assertTrue(result.contains("PENDING"));
    }

    @Test
    @DisplayName("Should set and get all User fields correctly")
    public void testUser_AllFields() {
        User user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setEmail("john@example.com");

        assertEquals(1L, user.getId());
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
    }

    @Test
    @DisplayName("Should set and get all Policy fields correctly")
    public void testPolicy_AllFields() {
        Policy policy = new Policy();
        policy.setId(2L);
        policy.setPolicyName("Health Shield");
        policy.setPremiumAmount(500.0);
        policy.setCoverageAmount(100000.0);

        assertEquals(2L, policy.getId());
        assertEquals("Health Shield", policy.getPolicyName());
        assertEquals(500.0, policy.getPremiumAmount());
        assertEquals(100000.0, policy.getCoverageAmount());
    }
}
