package com.group2.admin_service.service;

import com.group2.admin_service.dto.*;
import com.group2.admin_service.feign.ClaimsFeignClient;
import com.group2.admin_service.feign.PolicyFeignClient;
import com.group2.admin_service.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @InjectMocks
    private AdminServiceImpl adminService;

    @Mock
    private ClaimsFeignClient claimsFeignClient;

    @Mock
    private PolicyFeignClient policyFeignClient;

    @Mock
    private RabbitTemplate rabbitTemplate;

    // ==================== reviewClaim ====================
    @Test
    void testReviewClaim_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setStatus("APPROVED");

        adminService.reviewClaim(1L, request);

        verify(rabbitTemplate, times(1)).convertAndSend(eq("claim.exchange"), eq("claim.review"), any(ClaimReviewEvent.class));
    }

    // ==================== getClaimStatus ====================
    @Test
    void testGetClaimStatus() {
        ClaimStatusDTO dto = new ClaimStatusDTO();
        dto.setTotalClaims(5);
        when(claimsFeignClient.getClaimStatus(1L)).thenReturn(dto);

        ClaimStatusDTO result = adminService.getClaimStatus(1L);
        assertEquals(dto, result);
        assertEquals(5, result.getTotalClaims());
    }

    // ==================== getClaimsByUserId ====================
    @Test
    void testGetClaimsByUserId() {
        ClaimDTO c = new ClaimDTO();
        c.setClaimId(10L);
        List<ClaimDTO> list = Collections.singletonList(c);
        when(claimsFeignClient.getClaimsByUserId(1L)).thenReturn(list);

        List<ClaimDTO> result = adminService.getClaimsByUserId(1L);
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getClaimId());
    }

    // ==================== downloadClaimDocument ====================
    @Test
    void testDownloadClaimDocument() {
        byte[] content = new byte[]{1, 2, 3};
        ResponseEntity<byte[]> response = ResponseEntity.ok(content);
        when(claimsFeignClient.downloadDocument(1L)).thenReturn(response);

        ResponseEntity<byte[]> result = adminService.downloadClaimDocument(1L);
        assertEquals(response, result);
    }

    // ==================== getAllClaims (complex mapping) ====================
    @Test
    void testGetAllClaims_Mapping() {
        Map<String, Object> mockData = new HashMap<>();
        mockData.put("totalPages", 2);
        mockData.put("totalElements", 15);
        mockData.put("number", 0);
        mockData.put("size", 10);

        List<Map<String, Object>> content = new ArrayList<>();
        Map<String, Object> claimMap = new HashMap<>();
        claimMap.put("claimId", 1L);
        claimMap.put("userId", 5L);
        claimMap.put("claimAmount", 500.0);
        claimMap.put("status", "PENDING");
        claimMap.put("description", "Test claim");
        content.add(claimMap);
        mockData.put("content", content);

        when(claimsFeignClient.getAllClaims(0, 10)).thenReturn(mockData);

        PageResponse<ClaimDTO> result = adminService.getAllClaims(0, 10);

        assertEquals(2, result.getTotalPages());
        assertEquals(15, result.getTotalElements());
        assertEquals(0, result.getNumber());
        assertEquals(10, result.getSize());
        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getContent().get(0).getClaimId());
    }

    @Test
    void testGetAllClaims_NullData() {
        when(claimsFeignClient.getAllClaims(0, 10)).thenReturn(null);
        PageResponse<ClaimDTO> result = adminService.getAllClaims(0, 10);
        assertNotNull(result);
    }

    @Test
    void testGetAllClaims_EmptyContent() {
        Map<String, Object> mockData = new HashMap<>();
        mockData.put("totalPages", 0);
        mockData.put("totalElements", 0);
        mockData.put("number", 0);
        mockData.put("size", 10);
        mockData.put("content", Collections.emptyList());

        when(claimsFeignClient.getAllClaims(0, 10)).thenReturn(mockData);
        PageResponse<ClaimDTO> result = adminService.getAllClaims(0, 10);
        assertEquals(0, result.getContent().size());
    }

    @Test
    void testGetAllClaims_NullFields() {
        Map<String, Object> mockData = new HashMap<>();
        mockData.put("totalPages", null);
        mockData.put("totalElements", null);
        mockData.put("number", null);
        mockData.put("size", null);
        mockData.put("content", null);

        when(claimsFeignClient.getAllClaims(0, 10)).thenReturn(mockData);
        PageResponse<ClaimDTO> result = adminService.getAllClaims(0, 10);
        assertNotNull(result);
    }

    // ==================== updateClaim ====================
    @Test
    void testUpdateClaim() {
        ClaimDTO dto = new ClaimDTO();
        dto.setClaimId(1L);
        when(claimsFeignClient.updateClaim(1L, dto)).thenReturn(dto);

        ClaimDTO result = adminService.updateClaim(1L, dto);
        assertEquals(1L, result.getClaimId());
    }

    // ==================== createPolicy ====================
    @Test
    void testCreatePolicy() {
        PolicyRequestDTO request = new PolicyRequestDTO();
        PolicyDTO response = new PolicyDTO();
        response.setId(1L);
        when(policyFeignClient.createPolicy(request)).thenReturn(response);

        PolicyDTO result = adminService.createPolicy(request);
        assertEquals(1L, result.getId());
    }

    // ==================== updatePolicy ====================
    @Test
    void testUpdatePolicy() {
        PolicyRequestDTO request = new PolicyRequestDTO();
        PolicyDTO response = new PolicyDTO();
        response.setId(1L);
        when(policyFeignClient.updatePolicy(1L, request)).thenReturn(response);

        PolicyDTO result = adminService.updatePolicy(1L, request);
        assertEquals(1L, result.getId());
    }

    // ==================== deletePolicy ====================
    @Test
    void testDeletePolicy() {
        adminService.deletePolicy(1L);
        verify(policyFeignClient, times(1)).deletePolicy(1L);
    }

    // ==================== getUserPolicies ====================
    @Test
    void testGetUserPolicies() {
        List<Object> list = Collections.singletonList(new Object());
        when(policyFeignClient.getUserPolicies(1L)).thenReturn(list);

        List<Object> result = adminService.getUserPolicies(1L);
        assertEquals(1, result.size());
    }

    // ==================== getAllUserPolicies ====================
    @Test
    void testGetAllUserPolicies() {
        List<Object> list = Collections.singletonList(new Object());
        when(policyFeignClient.getAllUserPolicies()).thenReturn(list);

        List<Object> result = adminService.getAllUserPolicies();
        assertEquals(1, result.size());
    }

    // ==================== cancelPolicy ====================
    @Test
    void testCancelPolicy() {
        when(policyFeignClient.cancelPolicy(1L)).thenReturn("Cancelled");

        Object result = adminService.cancelPolicy(1L);
        assertEquals("Cancelled", result);
    }

    // ==================== deleteClaim ====================
    @Test
    void testDeleteClaim() {
        adminService.deleteClaim(1L);
        verify(claimsFeignClient, times(1)).deleteClaim(1L);
    }

    // ==================== getReports ====================
    @Test
    void testGetReports() {
        ClaimStatusDTO claimStats = new ClaimStatusDTO();
        claimStats.setTotalClaims(10);
        claimStats.setApprovedClaims(6);
        claimStats.setRejectedClaims(4);

        PolicyStatsDTO policyStats = new PolicyStatsDTO();
        policyStats.setTotalPolicies(5L);
        policyStats.setTotalRevenue(5000.0);

        when(claimsFeignClient.getClaimStats()).thenReturn(claimStats);
        when(policyFeignClient.getPolicyStats()).thenReturn(policyStats);

        ReportResponse result = adminService.getReports();
        assertEquals(10, result.getTotalClaims());
        assertEquals(6, result.getApprovedClaims());
        assertEquals(4, result.getRejectedClaims());
        assertEquals(5, result.getTotalPolicies());
        assertEquals(5000.0, result.getTotalRevenue());
    }

    // ==================== ALL FALLBACKS ====================
    @Test
    void testRecoverReviewClaim() {
        Throwable e = new RuntimeException("Error");
        ReviewRequest request = new ReviewRequest();
        assertThrows(RuntimeException.class, () -> adminService.recoverReviewClaim(1L, request, e));
    }

    @Test
    void testRecoverGetClaimStatus() {
        ClaimStatusDTO result = adminService.recoverGetClaimStatus(1L, new RuntimeException("E"));
        assertNotNull(result);
    }

    @Test
    void testRecoverGetClaimsByUserId() {
        List<ClaimDTO> result = adminService.recoverGetClaimsByUserId(1L, new RuntimeException("E"));
        assertTrue(result.isEmpty());
    }

    @Test
    void testRecoverDownloadClaimDocument() {
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverDownloadClaimDocument(1L, e));
    }

    @Test
    void testRecoverGetAllClaims() {
        PageResponse<ClaimDTO> result = adminService.recoverGetAllClaims(0, 10, new RuntimeException("E"));
        assertNotNull(result);
    }

    @Test
    void testRecoverUpdateClaim() {
        ClaimDTO dto = new ClaimDTO();
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverUpdateClaim(1L, dto, e));
    }

    @Test
    void testRecoverCreatePolicy() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverCreatePolicy(dto, e));
    }

    @Test
    void testRecoverUpdatePolicy() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverUpdatePolicy(1L, dto, e));
    }

    @Test
    void testRecoverDeletePolicy() {
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverDeletePolicy(1L, e));
    }

    @Test
    void testRecoverGetUserPolicies() {
        List<Object> result = adminService.recoverGetUserPolicies(1L, new RuntimeException("E"));
        assertTrue(result.isEmpty());
    }

    @Test
    void testRecoverCancelPolicy() {
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverCancelPolicy(1L, e));
    }

    @Test
    void testRecoverGetReports() {
        ReportResponse r = adminService.recoverGetReports(new RuntimeException("E"));
        assertEquals(0, r.getTotalClaims());
        assertEquals(0, r.getApprovedClaims());
        assertEquals(0, r.getRejectedClaims());
        assertEquals(0, r.getTotalPolicies());
        assertEquals(0.0, r.getTotalRevenue());
    }

    @Test
    void testRecoverDeleteClaim() {
        RuntimeException e = new RuntimeException("E");
        assertThrows(RuntimeException.class, () -> adminService.recoverDeleteClaim(1L, e));
    }
}
