package com.group2.policy_service.service;

import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.PolicyStatsDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.entity.*;
import com.group2.policy_service.repository.PolicyRepository;
import com.group2.policy_service.repository.PolicyTypeRepository;
import com.group2.policy_service.repository.UserPolicyRepository;
import com.group2.policy_service.service.impl.PolicyQueryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PolicyQueryServiceTest {

    @InjectMocks
    private PolicyQueryServiceImpl policyQueryService;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private UserPolicyRepository userPolicyRepository;

    @Mock
    private PolicyTypeRepository policyTypeRepository;

    @Test
    public void testGetPoliciesByUserId() {
        Policy p = new Policy();
        p.setPolicyName("Health");
        PolicyType pType = new PolicyType();
        pType.setId(1L);
        pType.setCategory(PolicyCategory.HEALTH);
        p.setPolicyType(pType);
        UserPolicy up = new UserPolicy();
        up.setId(1L);
        up.setUserId(10L);
        up.setPolicy(p);

        when(userPolicyRepository.findByUserId(10L)).thenReturn(Collections.singletonList(up));

        List<UserPolicyResponseDTO> result = policyQueryService.getPoliciesByUserId(10L);
        assertEquals(1, result.size());
        assertEquals("Health", result.get(0).getPolicyName());
    }

    @Test
    public void testGetAllUserPolicies() {
        Policy p = new Policy();
        p.setPolicyName("Life");
        UserPolicy up = new UserPolicy();
        up.setId(2L);
        up.setPolicy(p);

        when(userPolicyRepository.findAll()).thenReturn(Collections.singletonList(up));

        List<UserPolicyResponseDTO> result = policyQueryService.getAllUserPolicies();
        assertEquals(1, result.size());
    }

    @Test
    public void testGetAllPolicies() {
        Policy p = new Policy();
        p.setPolicyName("Auto");
        when(policyRepository.findByActiveTrue()).thenReturn(Collections.singletonList(p));

        List<PolicyResponseDTO> result = policyQueryService.getAllPolicies();
        assertEquals(1, result.size());
        assertEquals("Auto", result.get(0).getPolicyName());
    }

    @Test
    public void testGetAllPolicyTypes() {
        PolicyType type = new PolicyType();
        when(policyTypeRepository.findAll()).thenReturn(Collections.singletonList(type));

        List<PolicyType> result = policyQueryService.getAllPolicyTypes();
        assertFalse(result.isEmpty());
    }

    @Test
    public void testGetPolicyById() {
        Policy p = new Policy();
        p.setId(1L);
        p.setPolicyName("Term");
        when(policyRepository.findById(1L)).thenReturn(Optional.of(p));

        PolicyResponseDTO result = policyQueryService.getPolicyById(1L);
        assertEquals("Term", result.getPolicyName());
    }

    @Test
    public void testGetPolicyStats() {
        when(userPolicyRepository.count()).thenReturn(10L);
        when(userPolicyRepository.sumPremiumAmount()).thenReturn(1000.0);

        PolicyStatsDTO result = policyQueryService.getPolicyStats();
        assertEquals(10L, result.getTotalPolicies());
        assertEquals(1000.0, result.getTotalRevenue());
    }
}
