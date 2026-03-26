package com.group2.admin_service.service;

import java.util.Collections;
import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

import com.group2.admin_service.dto.ClaimDTO;
import com.group2.admin_service.dto.ClaimReviewEvent;
import com.group2.admin_service.dto.ClaimStatusDTO;
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

    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverReviewClaim")
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

    public void recoverReviewClaim(Long claimId, ReviewRequest request, Throwable e) {
        throw new RuntimeException("Fallback: Could not review claim. Service might be down. Reason: " + e.getMessage());
    }

    // Get claim status
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetClaimStatus")
    public ClaimStatusDTO getClaimStatus(Long claimId) {
        return claimsFeignClient.getClaimStatus(claimId);
    }

    public ClaimStatusDTO recoverGetClaimStatus(Long claimId, Throwable e) {
        return new ClaimStatusDTO();
    }

    // Get claims by user ID
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetClaimsByUserId")
    public List<ClaimDTO> getClaimsByUserId(Long userId) {
        return claimsFeignClient.getClaimsByUserId(userId);
    }

    public List<ClaimDTO> recoverGetClaimsByUserId(Long userId, Throwable e) {
        return Collections.emptyList();
    }

    // Download Claim Document
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverDownloadClaimDocument")
    public org.springframework.http.ResponseEntity<byte[]> downloadClaimDocument(Long claimId) {
        System.out.println("📥 Requesting document download for Claim ID: " + claimId);
        return claimsFeignClient.downloadDocument(claimId);
    }
    
    public org.springframework.http.ResponseEntity<byte[]> recoverDownloadClaimDocument(Long claimId, Throwable e) {
        System.err.println("❌ document download failed for Claim " + claimId + " due to: " + e.getMessage());
        throw new RuntimeException("Fallback: Could not download document. Service might be down. Reason: " + e.getMessage());
    }


    // Get all claims with pagination
    // Get all claims with pagination
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetAllClaims")
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


    public com.group2.admin_service.dto.PageResponse<ClaimDTO> recoverGetAllClaims(int page, int size, Throwable e) {
        System.err.println("Recovering from getAllClaims error: " + e.getMessage());
        e.printStackTrace();
        return new com.group2.admin_service.dto.PageResponse<>();
    }

    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverUpdateClaim")
    public ClaimDTO updateClaim(Long id, ClaimDTO dto) {
        return claimsFeignClient.updateClaim(id, dto);
    }

    public ClaimDTO recoverUpdateClaim(Long id, ClaimDTO dto, Throwable e) {
        throw new RuntimeException("Fallback: Could not update claim details. Service might be down. Reason: " + e.getMessage());
    }


    
    // ==================== POLICY PRODUCT MANAGEMENT ====================


    // Create policy product
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverCreatePolicy")
    public PolicyDTO createPolicy(PolicyRequestDTO dto) {
        try {
            return policyFeignClient.createPolicy(dto);
        } catch (feign.FeignException e) {
            String message = e.contentUTF8();
            // If the message contains a JSON, you could parse it, but let's just use the raw text if short
            throw new RuntimeException("Policy Creation Failed: " + (message.length() < 100 ? message : "Invalid Data"));
        } catch (Exception e) {
            throw new RuntimeException("Policy Service unreachable: " + e.getMessage());
        }
    }

    public PolicyDTO recoverCreatePolicy(PolicyRequestDTO dto, Throwable e) {
        throw new RuntimeException("Fallback: Could not create policy. Service might be down. Reason: " + e.getMessage());
    }

    // Update policy product
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverUpdatePolicy")
    public PolicyDTO updatePolicy(Long id, PolicyRequestDTO dto) {
        return policyFeignClient.updatePolicy(id, dto);
    }

    public PolicyDTO recoverUpdatePolicy(Long id, PolicyRequestDTO dto, Throwable e) {
        throw new RuntimeException("Fallback: Could not update policy. Service might be down. Reason: " + e.getMessage());
    }

    // Delete policy product
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverDeletePolicy")
    public void deletePolicy(Long id) {
        policyFeignClient.deletePolicy(id);
    }

    public void recoverDeletePolicy(Long id, Throwable e) {
        throw new RuntimeException("Fallback: Could not delete policy. Service might be down. Reason: " + e.getMessage());
    }

    // Get all policies purchased by a user
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetUserPolicies")
    public List<Object> getUserPolicies(Long userId) {
        return policyFeignClient.getUserPolicies(userId);
    }

    public List<Object> getAllUserPolicies() {
        return policyFeignClient.getAllUserPolicies();
    }


    public java.util.List<Object> recoverGetUserPolicies(Long userId, Throwable e) {
        return java.util.Collections.emptyList();
    }

    // Cancel a user's policy (lifecycle: ACTIVE → CANCELLED)
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverCancelPolicy")
    public Object cancelPolicy(Long id) {
        return policyFeignClient.cancelPolicy(id);
    }

    public Object recoverCancelPolicy(Long id, Throwable e) {
        throw new RuntimeException("Fallback: Could not cancel policy. Service might be down. Reason: " + e.getMessage());
    }
    
    // ==================== REPORTS ====================

    //Reports (DYNAMIC FROM CLAIMS + POLICY SERVICES)
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetReports")
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

    public ReportResponse recoverGetReports(Throwable e) {
        ReportResponse report = new ReportResponse();
        report.setTotalClaims(0);
        report.setApprovedClaims(0);
        report.setRejectedClaims(0);
        report.setTotalPolicies(0);
        report.setTotalRevenue(0.0);
        return report;
    }
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverDeleteClaim")
    public void deleteClaim(Long id) {
        claimsFeignClient.deleteClaim(id);
    }

    public void recoverDeleteClaim(Long id, Throwable e) {
        throw new RuntimeException("Fallback: Could not delete claim. Service might be down. Reason: " + e.getMessage());
    }
}