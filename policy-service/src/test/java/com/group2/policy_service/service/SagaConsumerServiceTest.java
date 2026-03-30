package com.group2.policy_service.service;

import com.group2.policy_service.dto.event.PaymentStatusEvent;
import com.group2.policy_service.entity.Policy;
import com.group2.policy_service.entity.PolicyStatus;
import com.group2.policy_service.entity.UserPolicy;
import com.group2.policy_service.repository.UserPolicyRepository;
import com.group2.policy_service.service.impl.SagaConsumerServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SagaConsumerServiceTest {

    @Mock
    private UserPolicyRepository userPolicyRepository;

    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private SagaConsumerServiceImpl sagaConsumerService;

    @Test
    public void testConsumePaymentStatus_Success() {
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setUserPolicyId(1L);
        event.setStatus("SUCCESS");

        UserPolicy policy = new UserPolicy();
        policy.setId(1L);
        policy.setUserId(10L);
        policy.setStatus(PolicyStatus.PENDING_PAYMENT);

        when(userPolicyRepository.findById(1L)).thenReturn(Optional.of(policy));
        Cache cache = mock(Cache.class);
        when(cacheManager.getCache("userPolicies")).thenReturn(cache);

        sagaConsumerService.consumePaymentStatus(event);

        assertEquals(PolicyStatus.ACTIVE, policy.getStatus());
        verify(userPolicyRepository, times(1)).save(policy);
        verify(cache).evict(10L);
    }

    @Test
    public void testConsumePaymentStatus_SuccessRenewal() {
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setUserPolicyId(1L);
        event.setStatus("SUCCESS");

        Policy blueprint = new Policy();
        blueprint.setDurationInMonths(12);

        UserPolicy policy = new UserPolicy();
        policy.setId(1L);
        policy.setUserId(10L);
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setPolicy(blueprint);

        when(userPolicyRepository.findById(1L)).thenReturn(Optional.of(policy));
        Cache cache = mock(Cache.class);
        when(cacheManager.getCache("userPolicies")).thenReturn(cache);

        sagaConsumerService.consumePaymentStatus(event);

        assertEquals(PolicyStatus.ACTIVE, policy.getStatus());
        verify(userPolicyRepository, times(1)).save(policy);
    }

    @Test
    public void testConsumePaymentStatus_Failure() {
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setUserPolicyId(1L);
        event.setStatus("FAILURE");

        UserPolicy policy = new UserPolicy();
        policy.setId(1L);
        policy.setStatus(PolicyStatus.PENDING_PAYMENT);

        when(userPolicyRepository.findById(1L)).thenReturn(Optional.of(policy));

        sagaConsumerService.consumePaymentStatus(event);

        assertEquals(PolicyStatus.CANCELLED, policy.getStatus());
        verify(userPolicyRepository, times(1)).save(policy);
    }
}
