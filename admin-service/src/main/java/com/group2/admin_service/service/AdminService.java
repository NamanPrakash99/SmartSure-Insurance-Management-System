package com.group2.admin_service.service;

import java.util.Collections;
import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.group2.admin_service.dto.ClaimDTO;
import com.group2.admin_service.dto.ClaimReviewEvent;
import com.group2.admin_service.dto.ClaimStatusDTO;
import com.group2.admin_service.dto.ClaimStatusUpdateDTO;
import com.group2.admin_service.dto.PolicyDTO;
import com.group2.admin_service.dto.PolicyRequestDTO;
import com.group2.admin_service.dto.PolicyStatsDTO;
import com.group2.admin_service.dto.ReportResponse;
import com.group2.admin_service.dto.ReviewRequest;
import com.group2.admin_service.feign.ClaimsFeignClient;
import com.group2.admin_service.feign.PolicyFeignClient;

@Service
public class AdminService {

    private final ClaimsFeignClient claimsFeignClient;
    private final PolicyFeignClient policyFeignClient;
    
    public AdminService(ClaimsFeignClient claimsFeignClient, PolicyFeignClient policyFeignClient) {
		this.claimsFeignClient = claimsFeignClient;
		this.policyFeignClient = policyFeignClient;
	}
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    // ==================== CLAIM OPERATIONS ====================

	@Retryable(
	    retryFor = Exception.class,
	    maxAttempts = 3,
	    backoff = @Backoff(delay = 2000)
	)
	public void reviewClaim(Long claimId, ReviewRequest request) {
	
	    // 1. Create Event DTO (DO NOT send ReviewRequest directly)
	    ClaimReviewEvent event = new ClaimReviewEvent();
	    event.setClaimId(claimId);
	    event.setStatus(request.getStatus());
	
	    // 2. Send message to RabbitMQ
	    rabbitTemplate.convertAndSend(
	            "claim.exchange",
	            "claim.review",
	            event
	    );
	
	    // 3. Logging (very useful for debugging)
	    System.out.println("🔥 Claim review event sent for claimId: " + claimId);
	}

    @Recover
    public void recoverReviewClaim(Exception e, Long claimId, ReviewRequest request) {
        throw new RuntimeException("Fallback: Could not review claim. Service might be down. Reason: " + e.getMessage());
    }

    // Get claim status
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public ClaimStatusDTO getClaimStatus(Long claimId) {
        return claimsFeignClient.getClaimStatus(claimId);
    }

    @Recover
    public ClaimStatusDTO recoverGetClaimStatus(Exception e, Long claimId) {
        return new ClaimStatusDTO();
    }

    // Get claims by user ID
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public List<ClaimDTO> getClaimsByUserId(Long userId) {
        return claimsFeignClient.getClaimsByUserId(userId);
    }

    @Recover
    public List<ClaimDTO> recoverGetClaimsByUserId(Exception e, Long userId) {
        return Collections.emptyList();
    }

    // Download Claim Document
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public org.springframework.http.ResponseEntity<byte[]> downloadClaimDocument(Long claimId) {
        System.out.println("📥 Requesting document download for Claim ID: " + claimId);
        return claimsFeignClient.downloadDocument(claimId);
    }
    
    @Recover
    public org.springframework.http.ResponseEntity<byte[]> recoverDownloadClaimDocument(Exception e, Long claimId) {
        System.err.println("❌ document download failed for Claim " + claimId + " due to: " + e.getMessage());
        throw new RuntimeException("Fallback: Could not download document. Service might be down. Reason: " + e.getMessage());
    }


    // Get all claims with pagination
    // Get all claims with pagination
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public com.group2.admin_service.dto.PageResponse<ClaimDTO> getAllClaims(int page, int size) {
        java.util.Map<String, Object> data = claimsFeignClient.getAllClaims(page, size);
        com.group2.admin_service.dto.PageResponse<ClaimDTO> response = new com.group2.admin_service.dto.PageResponse<>();
        
        if (data != null) {
            // Manual mapping from generic map to avoid deserialization errors
            response.setTotalPages(((Number) (data.get("totalPages") != null ? data.get("totalPages") : 0)).intValue());
            response.setTotalElements(((Number) (data.get("totalElements") != null ? data.get("totalElements") : 0)).longValue());
            response.setNumber(((Number) (data.get("number") != null ? data.get("number") : 0)).intValue());
            response.setSize(((Number) (data.get("size") != null ? data.get("size") : 0)).intValue());
            
            // Map content list
            Object contentObj = data.get("content");
            java.util.List<ClaimDTO> dtoList = new java.util.ArrayList<>();
            if (contentObj instanceof java.util.List) {
                java.util.List<?> rawList = (java.util.List<?>) contentObj;
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                for (Object item : rawList) {
                    try {
                        dtoList.add(mapper.convertValue(item, ClaimDTO.class));
                    } catch (Exception e) {
                        System.err.println("❌ Mapping error for claim item: " + e.getMessage());
                    }
                }
            }
            response.setContent(dtoList);
        }
        return response;
    }


    @Recover
    public com.group2.admin_service.dto.PageResponse<ClaimDTO> recoverGetAllClaims(Exception e, int page, int size) {
        System.err.println("Recovering from getAllClaims error: " + e.getMessage());
        e.printStackTrace();
        return new com.group2.admin_service.dto.PageResponse<>();
    }

    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public ClaimDTO updateClaim(Long id, ClaimDTO dto) {
        return claimsFeignClient.updateClaim(id, dto);
    }

    @Recover
    public ClaimDTO recoverUpdateClaim(Exception e, Long id, ClaimDTO dto) {
        throw new RuntimeException("Fallback: Could not update claim details. Service might be down. Reason: " + e.getMessage());
    }


    
    // ==================== POLICY PRODUCT MANAGEMENT ====================


    // Create policy product
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public PolicyDTO createPolicy(PolicyRequestDTO dto) {
        return policyFeignClient.createPolicy(dto);
    }

    @Recover
    public PolicyDTO recoverCreatePolicy(Exception e, PolicyRequestDTO dto) {
        throw new RuntimeException("Fallback: Could not create policy. Service might be down. Reason: " + e.getMessage());
    }

    // Update policy product
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public PolicyDTO updatePolicy(Long id, PolicyRequestDTO dto) {
        return policyFeignClient.updatePolicy(id, dto);
    }

    @Recover
    public PolicyDTO recoverUpdatePolicy(Exception e, Long id, PolicyRequestDTO dto) {
        throw new RuntimeException("Fallback: Could not update policy. Service might be down. Reason: " + e.getMessage());
    }

    // Delete policy product
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void deletePolicy(Long id) {
        policyFeignClient.deletePolicy(id);
    }

    @Recover
    public void recoverDeletePolicy(Exception e, Long id) {
        throw new RuntimeException("Fallback: Could not delete policy. Service might be down. Reason: " + e.getMessage());
    }

    // Get all policies purchased by a user
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public List<Object> getUserPolicies(Long userId) {
        return policyFeignClient.getUserPolicies(userId);
    }

    public List<Object> getAllUserPolicies() {
        return policyFeignClient.getAllUserPolicies();
    }


    @Recover
    public java.util.List<Object> recoverGetUserPolicies(Exception e, Long userId) {
        return java.util.Collections.emptyList();
    }

    // Cancel a user's policy (lifecycle: ACTIVE → CANCELLED)
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public Object cancelPolicy(Long id) {
        return policyFeignClient.cancelPolicy(id);
    }

    @Recover
    public Object recoverCancelPolicy(Exception e, Long id) {
        throw new RuntimeException("Fallback: Could not cancel policy. Service might be down. Reason: " + e.getMessage());
    }
    
    // ==================== REPORTS ====================

    //Reports (DYNAMIC FROM CLAIMS + POLICY SERVICES)
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public ReportResponse getReports() {

        ReportResponse report = new ReportResponse();

        //Fetch data from Claims Service
        ClaimStatusDTO claimStats = claimsFeignClient.getClaimStats();

        report.setTotalClaims((int) claimStats.getTotalClaims());
        report.setApprovedClaims((int) claimStats.getApprovedClaims());
        report.setRejectedClaims((int) claimStats.getRejectedClaims());

        // Policy Service stats
         PolicyStatsDTO policyStats = policyFeignClient.getPolicyStats();
         report.setTotalPolicies((int) policyStats.getTotalPolicies());
         report.setTotalRevenue(policyStats.getTotalRevenue());

        return report;
    }

    @Recover
    public ReportResponse recoverGetReports(Exception e) {
        ReportResponse report = new ReportResponse();
        report.setTotalClaims(0);
        report.setApprovedClaims(0);
        report.setRejectedClaims(0);
        report.setTotalPolicies(0);
        report.setTotalRevenue(0.0);
        return report;
    }
}