package com.group2.policy_service.service;

import com.group2.policy_service.dto.PolicyRequestDTO;
import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;

public interface PolicyCommandService {
    UserPolicyResponseDTO purchasePolicy(Long policyId);
    PolicyResponseDTO createPolicy(PolicyRequestDTO dto);
    PolicyResponseDTO updatePolicy(Long id, PolicyRequestDTO dto);
    void deletePolicy(Long id);
    UserPolicyResponseDTO cancelPolicy(Long userPolicyId);
    UserPolicyResponseDTO renewPolicy(Long userPolicyId);
    void deleteUserPolicy(Long userPolicyId);
}
