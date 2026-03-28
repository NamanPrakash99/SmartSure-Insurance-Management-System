package com.group2.payment_service.dto;

import com.group2.payment_service.dto.event.PaymentStatusEvent;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PaymentDtoTest {
	
    @Test
    public void testPaymentRequest() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setAmount(100.0);
        request.setPolicyId(1L);

        assertEquals(1L, request.getUserId());
        assertEquals(100.0, request.getAmount());
    }

    @Test
    public void testPaymentResponse() {
        PaymentResponse response = new PaymentResponse("order_123", "CREATED", 100.0, "Success");
        assertEquals("order_123", response.getOrderId());
        assertEquals("CREATED", response.getStatus());
        assertEquals(100.0, response.getAmount());
    }

    @Test
    public void testPaymentStatusEvent() {
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setPaymentId("pay_123");
        event.setStatus("SUCCESS");
        assertEquals("SUCCESS", event.getStatus());
    }
}
