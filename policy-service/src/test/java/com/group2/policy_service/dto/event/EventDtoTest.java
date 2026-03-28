package com.group2.policy_service.dto.event;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EventDtoTest {

    @Test
    public void testPaymentStatusEvent() {
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setUserPolicyId(1L);
        event.setStatus("SUCCESS");
        event.setPaymentId("pay_123");

        assertEquals(1L, event.getUserPolicyId());
        assertEquals("SUCCESS", event.getStatus());
        assertEquals("pay_123", event.getPaymentId());
    }

    @Test
    public void testPolicyPurchaseEvent() {
        PolicyPurchaseEvent event = new PolicyPurchaseEvent();
        event.setUserId(10L);
        event.setPolicyId(1L);
        event.setAmount(500.0);
        event.setUserPolicyId(100L);

        assertEquals(10L, event.getUserId());
        assertEquals(1L, event.getPolicyId());
        assertEquals(500.0, event.getAmount());
        assertEquals(100L, event.getUserPolicyId());
    }
}
