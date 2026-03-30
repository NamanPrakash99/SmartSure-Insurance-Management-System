package com.group2.payment_service.service;

import com.group2.payment_service.dto.event.PolicyPurchaseEvent;
import com.group2.payment_service.entity.Transaction;
import com.group2.payment_service.repository.TransactionRepository;
import com.group2.payment_service.service.impl.PaymentSagaConsumerImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class PaymentSagaConsumerTest {

    @InjectMocks
    private PaymentSagaConsumerImpl paymentSagaConsumer;

    @Mock
    private TransactionRepository transactionRepository;

    @Test
    public void testConsumePurchaseEvent() {
        PolicyPurchaseEvent event = new PolicyPurchaseEvent();
        event.setUserId(1L);
        event.setPolicyId(1L);
        event.setUserPolicyId(1L);
        event.setAmount(1000.0);

        paymentSagaConsumer.consumePurchaseEvent(event);

        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }
}
