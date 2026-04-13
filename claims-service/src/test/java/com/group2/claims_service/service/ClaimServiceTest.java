package com.group2.claims_service.service;

import com.group2.claims_service.client.PolicyClient;
import com.group2.claims_service.dto.*;
import com.group2.claims_service.entity.Claim;
import com.group2.claims_service.entity.ClaimStatus;
import com.group2.claims_service.repository.ClaimDocumentRepository;
import com.group2.claims_service.repository.ClaimRepository;
import com.group2.claims_service.repository.UserRepository;
import com.group2.claims_service.service.impl.ClaimServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @InjectMocks
    private ClaimServiceImpl claimService;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ClaimDocumentRepository documentRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PolicyClient policyClient;

    @Test
    @DisplayName("Should initiate claim successfully when policy limit is not exceeded")
    void testInitiateClaim_Success() {
        ClaimRequestDTO request = new ClaimRequestDTO();
        request.setUserId(1L);
        request.setPolicyId(1L);
        request.setClaimAmount(5000.0);
        request.setDescription("Damaged car");

        UserPolicyResponseDTO policyByClient = new UserPolicyResponseDTO();
        policyByClient.setCoverageAmount(10000.0);

        when(policyClient.getUserPolicyById(anyLong(), anyString())).thenReturn(policyByClient);

        Claim claim = new Claim();
        claim.setId(101L);
        claim.setUserId(1L);
        claim.setPolicyId(1L);
        claim.setClaimAmount(5000.0);
        claim.setClaimStatus(ClaimStatus.SUBMITTED);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);

        ClaimResponseDTO response = claimService.initiateClaim(request);

        assertNotNull(response);
        assertEquals(101L, response.getClaimId());
        assertEquals("SUBMITTED", response.getStatus());
        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), (Object) any());
    }

    @Test
    @DisplayName("Should upload document successfully for valid Image/PDF")
    void testUploadDocument_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "data".getBytes());
        Claim claim = new Claim();
        claim.setId(1L);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        String result = claimService.uploadDocument(1L, file);

        assertEquals("Document uploaded Successfully", result);
        verify(documentRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should update claim status successfully via DTO")
    void testUpdateClaimStatus_Success() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setUserId(1L);
        claim.setClaimStatus(ClaimStatus.SUBMITTED);

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("under_review");
        dto.setRemark("Validating details");

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(Claim.class))).thenReturn(claim);

        claimService.updateClaimStatus(1L, dto);

        assertEquals(ClaimStatus.UNDER_REVIEW, claim.getClaimStatus());
        assertEquals("Validating details", claim.getRemark());
        verify(claimRepository, times(1)).save(claim);
    }

    @Test
    @DisplayName("Should return correct claim statistics")
    void testGetClaimStats() {
        when(claimRepository.count()).thenReturn(10L);
        when(claimRepository.countByClaimStatus(ClaimStatus.SUBMITTED)).thenReturn(5L);
        when(claimRepository.countByClaimStatus(ClaimStatus.APPROVED)).thenReturn(3L);
        when(claimRepository.countByClaimStatus(ClaimStatus.REJECTED)).thenReturn(2L);

        ClaimStatsDTO stats = claimService.getClaimStats();

        assertEquals(10L, stats.getTotalClaims());
        assertEquals(5L, stats.getSubmittedClaims());
        assertEquals(3L, stats.getApprovedClaims());
        assertEquals(2L, stats.getRejectedClaims());
    }

    @Test
    @DisplayName("Should get all claims with pagination mapping")
    void testGetAllClaims() {
        Pageable pageable = PageRequest.of(0, 5);
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        Page<Claim> page = new PageImpl<>(Collections.singletonList(claim), pageable, 1);

        when(claimRepository.findAll(pageable)).thenReturn(page);

        Page<ClaimResponseDTO> result = claimService.getAllClaims(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("SUBMITTED", result.getContent().get(0).getStatus());
    }

    @Test
    @DisplayName("Should delete claim and its documents")
    void testDeleteClaim_Success() {
        Claim claim = new Claim();
        claim.setId(1L);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        doNothing().when(documentRepository).deleteByClaimId(1L);
        doNothing().when(claimRepository).delete(claim);

        claimService.deleteClaim(1L);

        verify(documentRepository, times(1)).deleteByClaimId(1L);
        verify(claimRepository, times(1)).delete(claim);
    }
}
