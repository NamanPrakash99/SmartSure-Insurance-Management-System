package com.group2.policy_service.service;

import com.group2.policy_service.config.RabbitConfig;
import com.group2.policy_service.dto.event.PaymentStatusEvent;
import com.group2.policy_service.entity.PolicyStatus;
import com.group2.policy_service.entity.UserPolicy;
import com.group2.policy_service.repository.UserPolicyRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SagaConsumerService {

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @RabbitListener(queues = RabbitConfig.PAYMENT_STATUS_QUEUE)
    public void consumePaymentStatus(PaymentStatusEvent event) {
        UserPolicy policy = userPolicyRepository.findById(event.getUserPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found: " + event.getUserPolicyId()));

        if ("SUCCESS".equals(event.getStatus())) {
            policy.setStatus(PolicyStatus.ACTIVE);
            // Optional: Save payment ID to policy or a separate history
        } else {
            policy.setStatus(PolicyStatus.CANCELLED);
        }

        userPolicyRepository.save(policy);
    }
}
