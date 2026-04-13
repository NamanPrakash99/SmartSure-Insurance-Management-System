package com.group2.claims_service.service;

import com.group2.claims_service.dto.ClaimReportDto;
import com.group2.claims_service.dto.ClaimRequest;
import com.group2.claims_service.dto.ClaimResponse;
import com.group2.claims_service.entity.Claim;
import com.group2.claims_service.repository.ClaimRepository;
import com.group2.claims_service.service.impl.ClaimServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
    private EmailService emailService;

    @Test
    @DisplayName("Should initiate claim successfully when policy exists and limit not exceeded")
    void testInitiateClaim_Success() {
        ClaimRequest request = new ClaimRequest();
        request.setUserId(1L);
        request.setPolicyId(1L);
        request.setClaimAmount(5000.0);
        request.setClaimReason("Accident");

        Claim claim = new Claim();
        claim.setId(101L);
        claim.setClaimAmount(5000.0);
        claim.setStatus("SUBMITTED");

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);

        ClaimResponse response = claimService.initiateClaim(request);

        assertNotNull(response);
        assertEquals(5000.0, response.getClaimAmount());
        assertEquals("SUBMITTED", response.getStatus());
        verify(emailService, times(1)).sendEmail(any(), any(), any());
    }

    @Test
    @DisplayName("Should upload document successfully for valid formats")
    void testUploadDocument_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "test data".getBytes());
        Claim claim = new Claim();
        claim.setId(1L);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        String result = claimService.uploadDocument(1L, file);

        assertEquals("File uploaded successfully: test.png", result);
        assertNotNull(claim.getDocumentPath());
        verify(claimRepository, times(1)).save(claim);
    }

    @Test
    @DisplayName("Should throw RuntimeException when file format is invalid")
    void testUploadDocument_InvalidFormat() {
        MockMultipartFile file = new MockMultipartFile("file", "test.exe", "application/octet-stream", "bad data".getBytes());
        Claim claim = new Claim();
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        assertThrows(RuntimeException.class, () -> claimService.uploadDocument(1L, file));
    }

    @Test
    @DisplayName("Should update claim status successfully (SUBMITTED -> UNDER_REVIEW)")
    void testUpdateClaimStatus_Success() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setStatus("SUBMITTED");
        claim.setUserId(1L);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(Claim.class))).thenReturn(claim);

        String result = claimService.updateClaimStatus(1L, "UNDER_REVIEW", "Review started");

        assertEquals("Claim status updated to: UNDER_REVIEW", result);
        assertEquals("UNDER_REVIEW", claim.getStatus());
        verify(emailService, times(1)).sendEmail(any(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception for unauthorized status transition")
    void testUpdateClaimStatus_InvalidTransition() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setStatus("CLOSED");

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        assertThrows(RuntimeException.class, () -> claimService.updateClaimStatus(1L, "APPROVED", ""));
    }

    @Test
    @DisplayName("Should delete claim successfully")
    void testDeleteClaim_Success() {
        when(claimRepository.existsById(1L)).thenReturn(true);
        doNothing().when(claimRepository).deleteById(1L);

        String result = claimService.deleteClaim(1L);

        assertEquals("Claim deleted successfully", result);
        verify(claimRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception deleting non-existent claim")
    void testDeleteClaim_NotFound() {
        when(claimRepository.existsById(1L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> claimService.deleteClaim(1L));
    }

    @Test
    @DisplayName("Should return claim statistics")
    void testGetClaimStats() {
        when(claimRepository.count()).thenReturn(10L);
        when(claimRepository.findByStatus("APPROVED")).thenReturn(Collections.singletonList(new Claim()));
        when(claimRepository.findByStatus("REJECTED")).thenReturn(Collections.emptyList());
        when(claimRepository.findByStatus("SUBMITTED")).thenReturn(Collections.singletonList(new Claim()));

        ClaimReportDto stats = claimService.getClaimStats();

        assertEquals(10L, stats.getTotalClaims());
        assertEquals(1L, stats.getApprovedClaims());
        assertEquals(0L, stats.getRejectedClaims());
    }

    @Test
    @DisplayName("Should get all claims with pagination")
    void testGetAllClaims() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Claim> claimsList = Collections.singletonList(new Claim());
        Page<Claim> claimsPage = new PageImpl<>(claimsList, pageable, 1);

        when(claimRepository.findAll(pageable)).thenReturn(claimsPage);

        Page<ClaimResponse> result = claimService.getAllClaims(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
