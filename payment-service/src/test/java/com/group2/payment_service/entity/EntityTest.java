package com.group2.payment_service.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EntityTest {

    @Test
    public void testTransaction() {
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
    public void testUser() {
        User user = new User();
        user.setId(1L);
        assertEquals(1L, user.getId());
    }

    @Test
    public void testPolicy() {
        Policy policy = new Policy();
        policy.setId(1L);
        assertEquals(1L, policy.getId());
    }
}
