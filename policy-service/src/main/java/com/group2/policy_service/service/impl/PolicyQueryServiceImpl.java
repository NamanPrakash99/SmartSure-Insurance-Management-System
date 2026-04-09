package com.group2.policy_service.service.impl;

import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.PolicyStatsDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.entity.Policy;
import com.group2.policy_service.entity.PolicyType;
import com.group2.policy_service.entity.UserPolicy;
import com.group2.policy_service.repository.PolicyRepository;
import com.group2.policy_service.repository.PolicyTypeRepository;
import com.group2.policy_service.repository.UserPolicyRepository;
import com.group2.policy_service.service.PolicyQueryService;

/**
 * CQRS - Query Service for Policy Service.
 * Handles all READ operations.
 */
@Service
public class PolicyQueryServiceImpl implements PolicyQueryService {

    private final PolicyRepository policyRepository;
    private final UserPolicyRepository userPolicyRepository;
    private final PolicyTypeRepository policyTypeRepository;

    public PolicyQueryServiceImpl(PolicyRepository policyRepository,
                             UserPolicyRepository userPolicyRepository,
                             PolicyTypeRepository policyTypeRepository) {
        this.policyRepository = policyRepository;
        this.userPolicyRepository = userPolicyRepository;
        this.policyTypeRepository = policyTypeRepository;
    }

    @Cacheable(value = "userPolicies", key = "#userId")
    public List<UserPolicyResponseDTO> getPoliciesByUserId(Long userId) {
        return userPolicyRepository.findByUserId(userId)
                .stream()
                .map(this::mapToUserPolicyResponse)
                .toList();
    }

    public List<UserPolicyResponseDTO> getAllUserPolicies() {
        return userPolicyRepository.findAll()
                .stream()
                .map(this::mapToUserPolicyResponse)
                .toList();
    }

    @Cacheable(value = "allPolicies")
    public List<PolicyResponseDTO> getAllPolicies() {
        return policyRepository.findByActiveTrue()
                .stream()
                .map(this::mapToPolicyResponse)
                .toList();
    }

    @Cacheable(value = "policyTypes")
    public List<PolicyType> getAllPolicyTypes() {
        return policyTypeRepository.findAll();
    }

    @Cacheable(value = "policyDetails", key = "#policyId")
    public PolicyResponseDTO getPolicyById(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        return mapToPolicyResponse(policy);
    }

    public PolicyStatsDTO getPolicyStats() {
        long totalPolicies = userPolicyRepository.count();
        Double revenue = userPolicyRepository.sumPremiumAmount();
        double totalRevenue = (revenue != null) ? revenue : 0.0;

        PolicyStatsDTO stats = new PolicyStatsDTO();
        stats.setTotalPolicies(totalPolicies);
        stats.setTotalRevenue(totalRevenue);
        return stats;
    }

    public UserPolicyResponseDTO getUserPolicyById(Long id) {
        UserPolicy userPolicy = userPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserPolicy not found with id: " + id));
        return mapToUserPolicyResponse(userPolicy);
    }

    // ================= MAPPERS =================

    private PolicyResponseDTO mapToPolicyResponse(Policy policy) {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setId(policy.getId());
        dto.setPolicyName(policy.getPolicyName());
        dto.setDescription(policy.getDescription());
        dto.setPremiumAmount(policy.getPremiumAmount());
        dto.setCoverageAmount(policy.getCoverageAmount());
        dto.setDurationInMonths(policy.getDurationInMonths());
        
        if (policy.getPolicyType() != null && policy.getPolicyType().getCategory() != null) {
            dto.setCategory(policy.getPolicyType().getCategory().name());
            dto.setPolicyTypeId(policy.getPolicyType().getId());
        }
        
        return dto;
    }

    private UserPolicyResponseDTO mapToUserPolicyResponse(UserPolicy userPolicy) {
        UserPolicyResponseDTO dto = new UserPolicyResponseDTO();
        dto.setId(userPolicy.getId());
        dto.setUserId(userPolicy.getUserId());
        dto.setPolicyName(userPolicy.getPolicy().getPolicyName());
        dto.setStatus(userPolicy.getStatus());
        dto.setPremiumAmount(userPolicy.getPremiumAmount());
        dto.setCoverageAmount(userPolicy.getPolicy().getCoverageAmount());
        dto.setStartDate(userPolicy.getStartDate());
        dto.setEndDate(userPolicy.getEndDate());
        dto.setPolicyId(userPolicy.getPolicy().getId());
        dto.setNextPaymentDueDate(userPolicy.getNextPaymentDueDate());
        return dto;
    }
}
