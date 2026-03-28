package com.group2.payment_service.controller;

import com.group2.payment_service.dto.PaymentRequest;
import com.group2.payment_service.dto.PaymentResponse;
import com.group2.payment_service.dto.PaymentVerifyRequest;
import com.group2.payment_service.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateOrder_Success() throws Exception {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setAmount(1000.0);

        PaymentResponse response = new PaymentResponse("order_123", "CREATED", 1000.0, "Success");

        when(paymentService.createOrder(any(PaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/payment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("order_123"));
    }

    @Test
    public void testCreateOrder_BadRequest() throws Exception {
        PaymentRequest request = new PaymentRequest();

        when(paymentService.createOrder(any(PaymentRequest.class))).thenThrow(new IllegalArgumentException("Invalid User ID"));

        mockMvc.perform(post("/payment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid User ID"));
    }

    @Test
    public void testVerifyPayment_Success() throws Exception {
        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setRazorpayOrderId("order_123");

        when(paymentService.verifyPayment(any(PaymentVerifyRequest.class))).thenReturn("Payment Verification Successful");

        mockMvc.perform(post("/payment/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Payment Verification Successful"));
    }

    @Test
    public void testVerifyPayment_Failed() throws Exception {
        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setRazorpayOrderId("order_123");

        when(paymentService.verifyPayment(any(PaymentVerifyRequest.class))).thenReturn("Payment Verification Failed");

        mockMvc.perform(post("/payment/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Payment Verification Failed"));
    }
}
