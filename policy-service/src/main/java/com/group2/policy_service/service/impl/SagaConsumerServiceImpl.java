package com.group2.policy_service.service.impl;

import com.group2.policy_service.config.RabbitConfig;
import com.group2.policy_service.dto.event.PaymentStatusEvent;
import com.group2.policy_service.entity.PolicyStatus;
import com.group2.policy_service.entity.UserPolicy;
import com.group2.policy_service.repository.UserPolicyRepository;
import com.group2.policy_service.service.SagaConsumerService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SagaConsumerServiceImpl implements SagaConsumerService {

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @Autowired
    private org.springframework.cache.CacheManager cacheManager;

    @RabbitListener(queues = RabbitConfig.PAYMENT_STATUS_QUEUE)
    public void consumePaymentStatus(PaymentStatusEvent event) {
        UserPolicy policy = userPolicyRepository.findById(event.getUserPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found: " + event.getUserPolicyId()));

        if ("SUCCESS".equals(event.getStatus())) {
            if (policy.getStatus() == PolicyStatus.PENDING_PAYMENT) {
                policy.setStatus(PolicyStatus.ACTIVE);
                policy.setNextPaymentDueDate(java.time.LocalDate.now().plusMonths(1));
                // Handle sequential renewal: advance based on current due date if it's already in the future
                java.time.LocalDate currentDueDate = policy.getNextPaymentDueDate();
                if (currentDueDate == null || currentDueDate.isBefore(java.time.LocalDate.now())) {
                    policy.setNextPaymentDueDate(java.time.LocalDate.now().plusMonths(1));
                } else {
                    policy.setNextPaymentDueDate(currentDueDate.plusMonths(1));
                }

                policy.setStatus(PolicyStatus.ACTIVE);
            }
        } else {
            // Only cancel if it was a new purchase pending payment
            if (policy.getStatus() == PolicyStatus.PENDING_PAYMENT) {
                policy.setStatus(PolicyStatus.CANCELLED);
            }
        }

        userPolicyRepository.save(policy);

        // Clear cache so UI fetches fresh state
        org.springframework.cache.Cache cache = cacheManager.getCache("userPolicies");
        if (cache != null) {
            cache.evict(policy.getUserId());
        }
    }
}
