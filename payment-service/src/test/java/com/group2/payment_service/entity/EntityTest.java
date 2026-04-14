package com.group2.payment_service.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {

    @Test
    void testTransactionEntity() {
        Transaction tx = new Transaction();
        tx.setId(1L);
        tx.setAmount(100.0);
        tx.setStatus("SUCCESS");
        tx.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, tx.getId());
        assertEquals(100.0, tx.getAmount());
        assertEquals("SUCCESS", tx.getStatus());
        assertNotNull(tx.getCreatedAt());
    }

    @Test
    void testPolicyEntity() {
        Policy p = new Policy();
        p.setId(1L);
        p.setPolicyName("Health");
        p.setPremiumAmount(500.0);

        assertEquals(1L, p.getId());
        assertEquals("Health", p.getPolicyName());
        assertEquals(500.0, p.getPremiumAmount());
    }

    @Test
    void testUserEntity() {
        User user = new User();
        user.setId(1L);
        user.setName("Name");
        user.setEmail("e");

        assertEquals(1L, user.getId());
        assertEquals("Name", user.getName());
        assertEquals("e", user.getEmail());
    }
}
