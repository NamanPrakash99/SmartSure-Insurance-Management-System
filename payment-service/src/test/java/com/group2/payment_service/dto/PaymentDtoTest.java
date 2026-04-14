package com.group2.payment_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PaymentDtoTest {

    @Test
    void testPaymentRequest() {
        PaymentRequest dto = new PaymentRequest();
        dto.setUserId(1L);
        dto.setPolicyId(1L);
        dto.setAmount(100.0);
        dto.setUserPolicyId(1L);

        assertEquals(1L, dto.getUserId());
        assertEquals(1L, dto.getPolicyId());
        assertEquals(100.0, dto.getAmount());
        assertEquals(1L, dto.getUserPolicyId());
    }

    @Test
    void testPaymentResponse() {
        PaymentResponse dto = new PaymentResponse();
        dto.setOrderId("order1");
        dto.setStatus("SUCCESS");
        dto.setAmount(100.0);
        dto.setMessage("OK");

        assertEquals("order1", dto.getOrderId());
        assertEquals("SUCCESS", dto.getStatus());
        assertEquals(100.0, dto.getAmount());
        assertEquals("OK", dto.getMessage());
    }
}
