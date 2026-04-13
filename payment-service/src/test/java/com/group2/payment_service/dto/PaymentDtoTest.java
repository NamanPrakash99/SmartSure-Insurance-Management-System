package com.group2.payment_service.dto;

import com.group2.payment_service.dto.event.PaymentStatusEvent;
import com.group2.payment_service.dto.event.PolicyPurchaseEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PaymentDtoTest {

    @Test
    @DisplayName("Should set and get PaymentRequest fields using setters")
    public void testPaymentRequest_Setters() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setAmount(100.0);
        request.setPolicyId(1L);
        request.setUserPolicyId(5L);

        assertEquals(1L, request.getUserId());
        assertEquals(100.0, request.getAmount());
        assertEquals(1L, request.getPolicyId());
        assertEquals(5L, request.getUserPolicyId());
    }

    @Test
    @DisplayName("Should construct PaymentRequest using all-args constructor")
    public void testPaymentRequest_AllArgsConstructor() {
        PaymentRequest request = new PaymentRequest(2L, 3L, 4L, 250.0);

        assertEquals(2L, request.getUserId());
        assertEquals(3L, request.getPolicyId());
        assertEquals(4L, request.getUserPolicyId());
        assertEquals(250.0, request.getAmount());
    }

    @Test
    @DisplayName("Should set and get PaymentResponse fields")
    public void testPaymentResponse() {
        PaymentResponse response = new PaymentResponse("order_123", "CREATED", 100.0, "Success");
        assertEquals("order_123", response.getOrderId());
        assertEquals("CREATED", response.getStatus());
        assertEquals(100.0, response.getAmount());
        assertEquals("Success", response.getMessage());
    }

    @Test
    @DisplayName("Should set and get all PaymentVerifyRequest fields")
    public void testPaymentVerifyRequest_Setters() {
        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setRazorpayOrderId("order_abc");
        request.setRazorpayPaymentId("pay_abc");
        request.setRazorpaySignature("sig_abc");

        assertEquals("order_abc", request.getRazorpayOrderId());
        assertEquals("pay_abc", request.getRazorpayPaymentId());
        assertEquals("sig_abc", request.getRazorpaySignature());
    }

    @Test
    @DisplayName("Should construct PaymentVerifyRequest using all-args constructor")
    public void testPaymentVerifyRequest_AllArgsConstructor() {
        PaymentVerifyRequest request = new PaymentVerifyRequest("order_xyz", "pay_xyz", "sig_xyz");

        assertEquals("order_xyz", request.getRazorpayOrderId());
        assertEquals("pay_xyz", request.getRazorpayPaymentId());
        assertEquals("sig_xyz", request.getRazorpaySignature());
    }

    @Test
    @DisplayName("Should set and get PaymentStatusEvent fields")
    public void testPaymentStatusEvent_Setters() {
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setUserPolicyId(10L);
        event.setPaymentId("pay_123");
        event.setStatus("SUCCESS");

        assertEquals(10L, event.getUserPolicyId());
        assertEquals("pay_123", event.getPaymentId());
        assertEquals("SUCCESS", event.getStatus());
    }

    @Test
    @DisplayName("Should construct PaymentStatusEvent using all-args constructor")
    public void testPaymentStatusEvent_AllArgsConstructor() {
        PaymentStatusEvent event = new PaymentStatusEvent(7L, "pay_456", "FAILED");

        assertEquals(7L, event.getUserPolicyId());
        assertEquals("pay_456", event.getPaymentId());
        assertEquals("FAILED", event.getStatus());
    }

    @Test
    @DisplayName("Should set and get all PolicyPurchaseEvent fields using setters")
    public void testPolicyPurchaseEvent_Setters() {
        PolicyPurchaseEvent event = new PolicyPurchaseEvent();
        event.setUserPolicyId(1L);
        event.setUserId(2L);
        event.setPolicyId(3L);
        event.setAmount(500.0);

        assertEquals(1L, event.getUserPolicyId());
        assertEquals(2L, event.getUserId());
        assertEquals(3L, event.getPolicyId());
        assertEquals(500.0, event.getAmount());
    }

    @Test
    @DisplayName("Should construct PolicyPurchaseEvent using all-args constructor")
    public void testPolicyPurchaseEvent_AllArgsConstructor() {
        PolicyPurchaseEvent event = new PolicyPurchaseEvent(11L, 22L, 33L, 999.99);

        assertEquals(11L, event.getUserPolicyId());
        assertEquals(22L, event.getUserId());
        assertEquals(33L, event.getPolicyId());
        assertEquals(999.99, event.getAmount());
    }
}
