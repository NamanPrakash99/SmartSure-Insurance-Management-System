package com.group2.claims_service.service;

import com.group2.claims_service.dto.*;
import com.group2.claims_service.entity.*;
import com.group2.claims_service.exception.ClaimNotFoundException;
import com.group2.claims_service.repository.*;
import com.group2.claims_service.service.impl.ClaimServiceImpl;
import com.group2.claims_service.service.EmailService;
import com.group2.claims_service.client.PolicyClient;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimServiceTest {

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

    // ==================== initiateClaim ====================
    @Test
    public void testInitiateClaim() {
        ClaimRequestDTO request = new ClaimRequestDTO();
        request.setPolicyId(1L);
        request.setUserId(1L);
        request.setClaimAmount(5000.0);
        request.setDescription("Accident");

        UserPolicyResponseDTO policy = new UserPolicyResponseDTO();
        policy.setCoverageAmount(10000.0);
        when(policyClient.getUserPolicyById(eq(1L), anyString())).thenReturn(policy);

        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(1L);
        claim.setUserId(1L);
        claim.setClaimAmount(5000.0);
        claim.setDescription("Accident");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);
        // userRepository findById can return empty for notification part, it's in try-catch

        ClaimResponseDTO result = claimService.initiateClaim(request);

        assertNotNull(result);
        assertEquals(1L, result.getClaimId());
        assertEquals("SUBMITTED", result.getStatus());
        assertEquals(5000.0, result.getClaimAmount());
        assertEquals("Accident", result.getDescription());
        assertEquals("Claim submitted successfully", result.getMessage());
        verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), (Object) any());
    }

    // ==================== uploadDocument ====================
    @Test
    public void testUploadDocument_Success() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("doc.pdf");
        when(file.getBytes()).thenReturn(new byte[10]);

        Claim claim = new Claim();
        claim.setId(1L);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        String result = claimService.uploadDocument(1L, file);
        assertEquals("Document uploaded Successfully", result);
        verify(documentRepository, times(1)).save(any(ClaimDocument.class));
    }

    @Test
    public void testUploadDocument_ClaimNotFound() {
        MultipartFile file = mock(MultipartFile.class);
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ClaimNotFoundException.class, () -> claimService.uploadDocument(99L, file));
    }

    // ==================== getClaimDocument ====================
    @Test
    public void testGetClaimDocument_Success() {
        ClaimDocument doc = new ClaimDocument();
        doc.setFileData(new byte[]{1, 2, 3});
        when(documentRepository.findFirstByClaimIdOrderByIdDesc(1L)).thenReturn(Optional.of(doc));

        ClaimDocument result = claimService.getClaimDocument(1L);
        assertNotNull(result);
    }

    // ==================== getClaimStatus ====================
    @Test
    public void testGetClaimStatus() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setClaimStatus(ClaimStatus.APPROVED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimResponseDTO result = claimService.getClaimStatus(1L);
        assertEquals(1L, result.getClaimId());
        assertEquals("APPROVED", result.getStatus());
    }

    // ==================== updateClaimStatus ====================
    @Test
    public void testUpdateClaimStatus_SubmittedToUnderReview() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        claim.setUserId(1L);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(Claim.class))).thenReturn(claim);

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("UNDER_REVIEW");
        claimService.updateClaimStatus(1L, dto);
        assertEquals(ClaimStatus.UNDER_REVIEW, claim.getClaimStatus());
    }

    @Test
    public void testUpdateClaimStatus_InvalidTransition() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.CLOSED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("APPROVED");
        assertThrows(RuntimeException.class, () -> claimService.updateClaimStatus(1L, dto));
    }

    // ==================== getClaimStats ====================
    @Test
    public void testGetClaimStats() {
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

    // ==================== deleteClaim ====================
    @Test
    public void testDeleteClaim() {
        Claim claim = new Claim();
        claim.setId(1L);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        claimService.deleteClaim(1L);

        verify(documentRepository, times(1)).deleteByClaimId(1L);
        verify(claimRepository, times(1)).delete(claim);
    }
}
