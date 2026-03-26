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

    @Autowired
    private org.springframework.cache.CacheManager cacheManager;

    @RabbitListener(queues = RabbitConfig.PAYMENT_STATUS_QUEUE)
    public void consumePaymentStatus(PaymentStatusEvent event) {
        UserPolicy policy = userPolicyRepository.findById(event.getUserPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found: " + event.getUserPolicyId()));

        if ("SUCCESS".equals(event.getStatus())) {
            if (policy.getStatus() == PolicyStatus.PENDING_PAYMENT) {
                policy.setStatus(PolicyStatus.ACTIVE);
            } else if (policy.getStatus() == PolicyStatus.ACTIVE || policy.getStatus() == PolicyStatus.EXPIRED) {
                // Handle renewal
                policy.setStatus(PolicyStatus.ACTIVE);
                java.time.LocalDate baseDate = (policy.getEndDate() == null || java.time.LocalDate.now().isAfter(policy.getEndDate())) 
                             ? java.time.LocalDate.now() : policy.getEndDate();
                policy.setEndDate(baseDate.plusMonths(policy.getPolicy().getDurationInMonths()));
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
