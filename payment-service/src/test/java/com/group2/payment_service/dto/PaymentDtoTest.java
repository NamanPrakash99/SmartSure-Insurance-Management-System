package com.group2.payment_service.dto;

import com.group2.payment_service.dto.event.PaymentStatusEvent;
import com.group2.payment_service.dto.event.PolicyPurchaseEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PaymentDtoTest {

    @Test
    @DisplayName("Should test PaymentRequest constructors and getters")
    void testPaymentRequest() {
        PaymentRequest request = new PaymentRequest(1L, 2L, 3L, 100.0);
        assertEquals(1L, request.getUserId());
        assertEquals(100.0, request.getAmount());
    }

    @Test
    @DisplayName("Should test PaymentResponse constructors and getters")
    void testPaymentResponse() {
        PaymentResponse response = new PaymentResponse("order_123", "CREATED", 100.0, "Success");
        assertEquals("order_123", response.getOrderId());
        assertEquals("CREATED", response.getStatus());
        assertEquals("Success", response.getMessage());
    }

    @Test
    @DisplayName("Should test PaymentVerifyRequest setters and getters")
    void testPaymentVerifyRequest() {
        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setRazorpayOrderId("order1");
        assertEquals("order1", request.getRazorpayOrderId());
    }

    @Test
    @DisplayName("Should test event DTOs")
    void testEventDtos() {
        PaymentStatusEvent statusEvent = new PaymentStatusEvent(1L, "pay1", "SUCCESS");
        assertEquals("SUCCESS", statusEvent.getStatus());

        PolicyPurchaseEvent purchaseEvent = new PolicyPurchaseEvent(1L, 2L, 3L, 1000.0);
        assertEquals(1000.0, purchaseEvent.getAmount());
    }
}
