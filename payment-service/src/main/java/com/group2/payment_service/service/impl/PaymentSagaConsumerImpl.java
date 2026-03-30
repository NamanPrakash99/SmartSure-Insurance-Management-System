package com.group2.payment_service.service.impl;

import com.group2.payment_service.config.RabbitConfig;
import com.group2.payment_service.dto.event.PolicyPurchaseEvent;
import com.group2.payment_service.entity.Transaction;
import com.group2.payment_service.repository.TransactionRepository;
import com.group2.payment_service.service.PaymentSagaConsumer;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentSagaConsumerImpl implements PaymentSagaConsumer {

    @Autowired
    private TransactionRepository transactionRepository;

    @RabbitListener(queues = RabbitConfig.PURCHASE_QUEUE)
    public void consumePurchaseEvent(PolicyPurchaseEvent event) {
        // Create a pending transaction record for this purchase
        Transaction transaction = new Transaction();
        transaction.setUserId(event.getUserId());
        transaction.setPolicyId(event.getPolicyId());
        transaction.setUserPolicyId(event.getUserPolicyId());
        transaction.setAmount(event.getAmount());
        transaction.setStatus("PENDING");
        
        transactionRepository.save(transaction);
        
        // Note: The actual Razorpay Order creation can happen here 
        // OR when the frontend calls the create-order endpoint.
        // For Saga, we just need to ensure we have a record to track.
    }
}
