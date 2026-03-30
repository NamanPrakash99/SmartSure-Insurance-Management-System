package com.group2.policy_service.service;

import com.group2.policy_service.dto.event.PaymentStatusEvent;

public interface SagaConsumerService {
    void consumePaymentStatus(PaymentStatusEvent event);
}
