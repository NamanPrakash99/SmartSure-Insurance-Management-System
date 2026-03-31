package com.group2.admin_service.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.group2.admin_service.dto.ClaimDTO;
import com.group2.admin_service.dto.ClaimStatusDTO;
import com.group2.admin_service.dto.PolicyDTO;
import com.group2.admin_service.dto.PolicyRequestDTO;
import com.group2.admin_service.dto.ReportResponse;
import com.group2.admin_service.dto.ReviewRequest;
import com.group2.admin_service.dto.UserDTO;
import com.group2.admin_service.service.AdminService;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private AdminService adminService;

    public AdminController(AdminService adminService) {
        super();
        this.adminService = adminService;
    }

    // ==================== CLAIM APIs ====================

    // Claim Review API (Approve / Reject)
    @PutMapping("/claims/{id}/review")
    public ResponseEntity<String> reviewClaim(
            @PathVariable("id") Long id,
            @RequestBody ReviewRequest request) {

        adminService.reviewClaim(id, request);
        return ResponseEntity.ok("Claim reviewed successfully");
    }

    // Get Claim Status
    @GetMapping("/claims/status/{id}")
    public ResponseEntity<ClaimStatusDTO> getStatus(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.getClaimStatus(id));
    }

    // Get all claims for a specific user
    @GetMapping("/claims/user/{userId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByUser(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(adminService.getClaimsByUserId(userId));
    }

    // Download a claim's uploaded document
    @GetMapping(value = "/claims/{id}/document", produces = {
            "application/pdf", "image/jpeg", "image/png", "application/octet-stream"
    })
    public ResponseEntity<byte[]> downloadDocument(@PathVariable("id") Long id) {
        return adminService.downloadClaimDocument(id);
    }

    // Get all claims with pagination
    @GetMapping("/claims")
    public ResponseEntity<Object> getAllClaims(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        try {
            return ResponseEntity.ok(adminService.getAllClaims(page, size));
        } catch (Exception e) {
            logger.error("Error in AdminController.getAllClaims: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Update claim details
    @PutMapping("/claims/{id}")
    public ResponseEntity<Object> updateClaim(
            @PathVariable("id") Long id,
            @RequestBody ClaimDTO dto) {
        try {
            return ResponseEntity.ok(adminService.updateClaim(id, dto));
        } catch (Exception e) {
            logger.error("❌ Error in AdminController.updateClaim: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/claims/{id}")
    public ResponseEntity<String> deleteClaim(@PathVariable("id") Long id) {
        adminService.deleteClaim(id);
        return ResponseEntity.ok("Claim deleted successfully");
    }

    // ==================== POLICY PRODUCT MANAGEMENT ====================

    @PostMapping("/policies")
    public ResponseEntity<PolicyDTO> createPolicy(@RequestBody PolicyRequestDTO dto) {
        return ResponseEntity.ok(adminService.createPolicy(dto));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<PolicyDTO> updatePolicy(
            @PathVariable("id") Long id,
            @RequestBody PolicyRequestDTO dto) {
        return ResponseEntity.ok(adminService.updatePolicy(id, dto));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<String> deletePolicy(@PathVariable("id") Long id) {
        adminService.deletePolicy(id);
        return ResponseEntity.ok("Policy deleted successfully");
    }

    @GetMapping("/user-policies/{userId}")
    public ResponseEntity<java.util.List<Object>> getUserPolicies(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(adminService.getUserPolicies(userId));
    }

    @GetMapping("/user-policies/all")
    public ResponseEntity<java.util.List<Object>> getAllUserPolicies() {
        return ResponseEntity.ok(adminService.getAllUserPolicies());
    }

    @PutMapping("/policies/{id}/cancel")
    public ResponseEntity<Object> cancelUserPolicy(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.cancelPolicy(id));
    }

    // ==================== CUSTOMER MANAGEMENT ====================

    @GetMapping("/customers")
    public ResponseEntity<List<UserDTO>> getAllCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }

    @GetMapping("/reports")
    public ResponseEntity<ReportResponse> getReports() {
        return ResponseEntity.ok(adminService.getReports());
    }
}