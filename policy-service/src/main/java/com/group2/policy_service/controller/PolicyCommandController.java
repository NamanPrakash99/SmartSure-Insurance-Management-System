package com.group2.policy_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.group2.policy_service.dto.PolicyRequestDTO;
import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.service.PolicyCommandService;

/**
 * CQRS - Command Controller for Policy Service.
 * Handles all WRITE operations (Create, Update, Delete, Purchase).
 */
@RestController
@RequestMapping("/api")
public class PolicyCommandController {

    private final PolicyCommandService policyCommandService;

    public PolicyCommandController(PolicyCommandService policyCommandService) {
        this.policyCommandService = policyCommandService;
    }

    @PostMapping("/policies/purchase")
    public UserPolicyResponseDTO purchasePolicy(@RequestParam("policyId") Long policyId) {
        return policyCommandService.purchasePolicy(policyId);
    }

    @PostMapping("/admin/policies")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public PolicyResponseDTO createPolicy(@RequestBody PolicyRequestDTO dto) {
        return policyCommandService.createPolicy(dto);
    }

    @PutMapping("/admin/policies/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public PolicyResponseDTO updatePolicy(@PathVariable("id") Long id,
                                          @RequestBody PolicyRequestDTO dto) {
        return policyCommandService.updatePolicy(id, dto);
    }

    @DeleteMapping("/admin/policies/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void deletePolicy(@PathVariable("id") Long id) {
        policyCommandService.deletePolicy(id);
    }

    @PutMapping("/admin/policies/{id}/cancel")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserPolicyResponseDTO> cancelPolicy(@PathVariable("id") Long id) {
        return ResponseEntity.ok(policyCommandService.cancelPolicy(id));
    }

    @PostMapping("/policies/renew/{id}")
    public ResponseEntity<UserPolicyResponseDTO> renewPolicy(@PathVariable("id") Long id) {
        return ResponseEntity.ok(policyCommandService.renewPolicy(id));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<String> deleteUserPolicy(@PathVariable("id") Long id) {
        policyCommandService.deleteUserPolicy(id);
        return ResponseEntity.ok("Policy instance deleted");
    }
}
