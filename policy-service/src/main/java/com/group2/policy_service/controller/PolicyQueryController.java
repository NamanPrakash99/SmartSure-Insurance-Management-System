package com.group2.policy_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.PolicyStatsDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.entity.PolicyType;
import com.group2.policy_service.service.PolicyQueryService;

/**
 * CQRS - Query Controller for Policy Service.
 * Handles all READ operations.
 */
@RestController
@RequestMapping("/api")
public class PolicyQueryController {

    private final PolicyQueryService policyQueryService;

    public PolicyQueryController(PolicyQueryService policyQueryService) {
        this.policyQueryService = policyQueryService;
    }
    
    @GetMapping("/policies")
    public List<PolicyResponseDTO> getAllPolicies() {
        return policyQueryService.getAllPolicies();
    }
    
    @GetMapping("/policy-types")
    public List<PolicyType> getAllPolicyTypes() {
        return policyQueryService.getAllPolicyTypes();
    }

    @GetMapping("/policies/{policyId}")
    public PolicyResponseDTO getPolicy(@PathVariable("policyId") Long policyId) {
        return policyQueryService.getPolicyById(policyId);
    }
    
    @GetMapping("/admin/user-policies/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or principal.toString() == #userId.toString()")
    public List<UserPolicyResponseDTO> getUserPolicies(@PathVariable("userId") Long userId) {
        return policyQueryService.getPoliciesByUserId(userId);
    }

    @GetMapping("/admin/user-policies/all")
    public List<UserPolicyResponseDTO> getAllUserPolicies() {
        return policyQueryService.getAllUserPolicies();
    }

    @GetMapping("/admin/policies/stats")
    public ResponseEntity<PolicyStatsDTO> getPolicyStats() {
        return ResponseEntity.ok(policyQueryService.getPolicyStats());
    }

    @GetMapping("/user-policy/{id}")
    public UserPolicyResponseDTO getUserPolicyById(@PathVariable("id") Long id) {
        return policyQueryService.getUserPolicyById(id);
    }
}
