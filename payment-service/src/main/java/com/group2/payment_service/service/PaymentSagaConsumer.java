package com.group2.payment_service.service;

import com.group2.payment_service.dto.event.PolicyPurchaseEvent;

public interface PaymentSagaConsumer {
    void consumePurchaseEvent(PolicyPurchaseEvent event);
}
