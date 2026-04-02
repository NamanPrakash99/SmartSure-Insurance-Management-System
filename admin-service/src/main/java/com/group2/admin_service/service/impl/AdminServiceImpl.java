package com.group2.admin_service.service.impl;

import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import com.group2.admin_service.dto.*;
import com.group2.admin_service.feign.AuthFeignClient;
import com.group2.admin_service.feign.ClaimsFeignClient;
import com.group2.admin_service.feign.PolicyFeignClient;
import com.group2.admin_service.service.AdminService;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    private final ClaimsFeignClient claimsFeignClient;
    private final PolicyFeignClient policyFeignClient;
    private final RabbitTemplate rabbitTemplate;
    private final AuthFeignClient authFeignClient;

    public AdminServiceImpl(ClaimsFeignClient claimsFeignClient, PolicyFeignClient policyFeignClient, 
                        RabbitTemplate rabbitTemplate, AuthFeignClient authFeignClient) {
        this.claimsFeignClient = claimsFeignClient;
        this.policyFeignClient = policyFeignClient;
        this.rabbitTemplate = rabbitTemplate;
        this.authFeignClient = authFeignClient;
    }

    public List<UserDTO> getAllCustomers() {
        return authFeignClient.getAllCustomers();
    }
    
    // ==================== CLAIM OPERATIONS ====================

    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverReviewClaim")
	public void reviewClaim(Long claimId, ReviewRequest request) {
	
	    // 1. Create Status Update DTO
	    ClaimStatusUpdateDTO statusDto = new ClaimStatusUpdateDTO();
	    statusDto.setStatus(request.getStatus());
	    statusDto.setRemark(request.getRemark());
	
	    // 2. Synchronous call to Claims service (ensures immediate DB update before UI refreshes)
	    claimsFeignClient.updateClaimStatus(claimId, statusDto);
	
	    // 3. Publish Event for Asynchronous processing (notifications, etc)
	    ClaimReviewEvent event = new ClaimReviewEvent();
	    event.setClaimId(claimId);
	    event.setStatus(request.getStatus());
	    event.setRemark(request.getRemark());
	    rabbitTemplate.convertAndSend("claim.exchange", "claim.review", event);
	
	    // 4. Optional: Logging
	    logger.info("✅ Claim status updated to {} for claimId: {}", request.getStatus(), claimId);
	}

    public void recoverReviewClaim(Long claimId, ReviewRequest request, Throwable e) {
        logger.error("Fallback: Could not review claim {} for status {}. Reason: {}", claimId, request.getStatus(), e.getMessage());
        throw new RuntimeException("Fallback: Could not review claim. Service might be down.");
    }

    // Get claim status
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetClaimStatus")
    public ClaimStatusDTO getClaimStatus(Long claimId) {
        return claimsFeignClient.getClaimStatus(claimId);
    }

    public ClaimStatusDTO recoverGetClaimStatus(Long claimId, Throwable e) {
        logger.error("Fallback: Could not get claim status for {}. Reason: {}", claimId, e.getMessage());
        return new ClaimStatusDTO();
    }

    // Get claims by user ID
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetClaimsByUserId")
    public List<ClaimDTO> getClaimsByUserId(Long userId) {
        return claimsFeignClient.getClaimsByUserId(userId);
    }

    public List<ClaimDTO> recoverGetClaimsByUserId(Long userId, Throwable e) {
        logger.error("Fallback: Could not get claims for user {}. Reason: {}", userId, e.getMessage());
        return Collections.emptyList();
    }

    // Download Claim Document
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverDownloadClaimDocument")
    public org.springframework.http.ResponseEntity<byte[]> downloadClaimDocument(Long claimId) {
        logger.info("📥 Requesting document download for Claim ID: {}", claimId);
        return claimsFeignClient.downloadDocument(claimId);
    }
    
    public org.springframework.http.ResponseEntity<byte[]> recoverDownloadClaimDocument(Long claimId, Throwable e) {
        logger.error("❌ document download failed for Claim {} due to: {}", claimId, e.getMessage());
        throw new RuntimeException("Fallback: Could not download document. Service might be down.");
    }


    // Get all claims with pagination
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetAllClaims")
    public com.group2.admin_service.dto.PageResponse<ClaimDTO> getAllClaims(int page, int size) {
        java.util.Map<String, Object> data = claimsFeignClient.getAllClaims(page, size);
        com.group2.admin_service.dto.PageResponse<ClaimDTO> response = new com.group2.admin_service.dto.PageResponse<>();
        
        if (data != null) {
            mapPageResponse(data, response);
        }
        return response;
    }

    private void mapPageResponse(java.util.Map<String, Object> data, com.group2.admin_service.dto.PageResponse<ClaimDTO> response) {
        response.setTotalPages(getSafeInt(data.get("totalPages")));
        response.setTotalElements(getSafeLong(data.get("totalElements")));
        response.setNumber(getSafeInt(data.get("number")));
        response.setSize(getSafeInt(data.get("size")));
        
        Object contentObj = data.get("content");
        if (contentObj instanceof java.util.List) {
            response.setContent(mapContentList((java.util.List<?>) contentObj));
        }
    }

    private int getSafeInt(Object value) {
        return value instanceof Number ? ((Number) value).intValue() : 0;
    }

    private long getSafeLong(Object value) {
        return value instanceof Number ? ((Number) value).longValue() : 0L;
    }

    private java.util.List<ClaimDTO> mapContentList(java.util.List<?> rawList) {
        java.util.List<ClaimDTO> dtoList = new java.util.ArrayList<>();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        for (Object item : rawList) {
            try {
                dtoList.add(mapper.convertValue(item, ClaimDTO.class));
            } catch (Exception e) {
                logger.error("❌ Mapping error for claim item: {}", e.getMessage());
            }
        }
        return dtoList;
    }

    public com.group2.admin_service.dto.PageResponse<ClaimDTO> recoverGetAllClaims(int page, int size, Throwable e) {
        logger.error("Recovering from getAllClaims error (page={}, size={}): {}", page, size, e.getMessage());
        return new com.group2.admin_service.dto.PageResponse<>();
    }

    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverUpdateClaim")
    public ClaimDTO updateClaim(Long id, ClaimDTO dto) {
        return claimsFeignClient.updateClaim(id, dto);
    }

    public ClaimDTO recoverUpdateClaim(Long id, ClaimDTO dto, Throwable e) {
        logger.error("Fallback: Could not update claim {}. Reason: {}", id, e.getMessage());
        throw new RuntimeException("Fallback: Could not update claim details. Service might be down.");
    }


    
    // ==================== POLICY PRODUCT MANAGEMENT ====================


    // Create policy product
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverCreatePolicy")
    public PolicyDTO createPolicy(PolicyRequestDTO dto) {
        try {
            return policyFeignClient.createPolicy(dto);
        } catch (feign.FeignException e) {
            String message = e.contentUTF8();
            throw new RuntimeException("Policy Creation Failed: " + message);
        } catch (Exception e) {
            throw new RuntimeException("Policy Service unreachable: " + e.getMessage());
        }
    }

    public PolicyDTO recoverCreatePolicy(PolicyRequestDTO dto, Throwable e) {
        logger.error("Fallback: Could not create policy. Reason: {}", e.getMessage());
        throw new RuntimeException(e.getMessage());
    }

    // Update policy product
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverUpdatePolicy")
    public PolicyDTO updatePolicy(Long id, PolicyRequestDTO dto) {
        return policyFeignClient.updatePolicy(id, dto);
    }

    public PolicyDTO recoverUpdatePolicy(Long id, PolicyRequestDTO dto, Throwable e) {
        logger.error("Fallback: Could not update policy {}. Reason: {}", id, e.getMessage());
        throw new RuntimeException("Fallback: Could not update policy. Service might be down.");
    }

    // Delete policy product
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverDeletePolicy")
    public void deletePolicy(Long id) {
        policyFeignClient.deletePolicy(id);
    }

    public void recoverDeletePolicy(Long id, Throwable e) {
        logger.error("Fallback: Could not delete policy {}. Reason: {}", id, e.getMessage());
        throw new RuntimeException("Fallback: Could not delete policy. Service might be down.");
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
        logger.error("Fallback: Could not get policies for user {}. Reason: {}", userId, e.getMessage());
        return java.util.Collections.emptyList();
    }

    // Cancel a user's policy (lifecycle: ACTIVE → CANCELLED)
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverCancelPolicy")
    public Object cancelPolicy(Long id) {
        return policyFeignClient.cancelPolicy(id);
    }

    public Object recoverCancelPolicy(Long id, Throwable e) {
        logger.error("Fallback: Could not cancel policy {}. Reason: {}", id, e.getMessage());
        throw new RuntimeException("Fallback: Could not cancel policy. Service might be down.");
    }
    
    // ==================== REPORTS ====================

    //Reports (DYNAMIC FROM CLAIMS + POLICY SERVICES)
    @CircuitBreaker(name = "adminService", fallbackMethod = "recoverGetReports")
    public ReportResponse getReports() {

        ReportResponse report = new ReportResponse();

        //Fetch data from Claims Service
        ClaimStatusDTO claimStats = claimsFeignClient.getClaimStats();

        report.setTotalClaims(getSafeInt(claimStats.getTotalClaims()));
        report.setApprovedClaims(getSafeInt(claimStats.getApprovedClaims()));
        report.setRejectedClaims(getSafeInt(claimStats.getRejectedClaims()));

        // Policy Service stats
         PolicyStatsDTO policyStats = policyFeignClient.getPolicyStats();
         report.setTotalPolicies(getSafeInt(policyStats.getTotalPolicies()));
         report.setTotalRevenue(policyStats.getTotalRevenue());

        return report;
    }

    public ReportResponse recoverGetReports(Throwable e) {
        logger.error("Fallback: Could not generate reports. Reason: {}", e.getMessage());
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
        logger.error("Fallback: Could not delete claim {}. Reason: {}", id, e.getMessage());
        throw new RuntimeException("Fallback: Could not delete claim. Service might be down.");
    }
}