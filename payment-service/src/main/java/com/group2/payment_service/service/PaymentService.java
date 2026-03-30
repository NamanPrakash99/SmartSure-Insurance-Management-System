package com.group2.payment_service.service;

import com.group2.payment_service.dto.PaymentRequest;
import com.group2.payment_service.dto.PaymentResponse;
import com.group2.payment_service.dto.PaymentVerifyRequest;

public interface PaymentService {
    PaymentResponse createOrder(PaymentRequest request);
    String verifyPayment(PaymentVerifyRequest verifyRequest);
}
