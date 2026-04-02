package com.group2.claims_service.service;

import com.group2.claims_service.dto.*;
import com.group2.claims_service.entity.*;
import com.group2.claims_service.exception.ClaimNotFoundException;
import com.group2.claims_service.repository.*;
import com.group2.claims_service.service.impl.ClaimServiceImpl;
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

    // ==================== initiateClaim ====================
    @Test
    public void testInitiateClaim() {
        ClaimRequestDTO request = new ClaimRequestDTO();
        request.setPolicyId(1L);
        request.setUserId(1L);
        request.setClaimAmount(5000.0);
        request.setDescription("Accident");

        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(1L);
        claim.setUserId(1L);
        claim.setClaimAmount(5000.0);
        claim.setDescription("Accident");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);

        when(claimRepository.save(any(Claim.class))).thenReturn(claim);

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
    public void testUploadDocument_ImageFile() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getContentType()).thenReturn("image/jpeg");
        when(file.getOriginalFilename()).thenReturn("photo.jpg");
        when(file.getBytes()).thenReturn(new byte[10]);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(new Claim()));

        String result = claimService.uploadDocument(1L, file);
        assertEquals("Document uploaded Successfully", result);
    }

    @Test
    public void testUploadDocument_InvalidFormat() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getContentType()).thenReturn("text/plain");
        when(file.getOriginalFilename()).thenReturn("readme.txt");

        when(claimRepository.findById(1L)).thenReturn(Optional.of(new Claim()));

        assertThrows(IllegalArgumentException.class, () -> claimService.uploadDocument(1L, file));
    }

    @Test
    public void testUploadDocument_ValidByFilename() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getContentType()).thenReturn(null);
        when(file.getOriginalFilename()).thenReturn("photo.png");
        when(file.getBytes()).thenReturn(new byte[5]);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(new Claim()));

        String result = claimService.uploadDocument(1L, file);
        assertEquals("Document uploaded Successfully", result);
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

    @Test
    public void testGetClaimDocument_NotFound() {
        when(documentRepository.findFirstByClaimIdOrderByIdDesc(99L)).thenReturn(Optional.empty());
        assertThrows(ClaimNotFoundException.class, () -> claimService.getClaimDocument(99L));
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

    @Test
    public void testGetClaimStatus_NotFound() {
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ClaimNotFoundException.class, () -> claimService.getClaimStatus(99L));
    }

    // ==================== getClaimById ====================
    @Test
    public void testGetClaimById() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(2L);
        claim.setUserId(3L);
        claim.setClaimAmount(500.0);
        claim.setDescription("Desc");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimResponseDTO result = claimService.getClaimById(1L);
        assertEquals(1L, result.getClaimId());
        assertEquals(2L, result.getPolicyId());
        assertEquals(3L, result.getUserId());
        assertEquals(500.0, result.getClaimAmount());
        assertEquals("Desc", result.getDescription());
        assertEquals("SUBMITTED", result.getStatus());
    }

    // ==================== updateClaimStatus ====================
    @Test
    public void testUpdateClaimStatus_SubmittedToUnderReview() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("UNDER_REVIEW");
        claimService.updateClaimStatus(1L, dto);
        assertEquals(ClaimStatus.UNDER_REVIEW, claim.getClaimStatus());
    }

    @Test
    public void testUpdateClaimStatus_UnderReviewToApproved() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.UNDER_REVIEW);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("APPROVED");
        claimService.updateClaimStatus(1L, dto);
        assertEquals(ClaimStatus.APPROVED, claim.getClaimStatus());
    }

    @Test
    public void testUpdateClaimStatus_UnderReviewToRejected() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.UNDER_REVIEW);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("REJECTED");
        claimService.updateClaimStatus(1L, dto);
        assertEquals(ClaimStatus.REJECTED, claim.getClaimStatus());
    }

    @Test
    public void testUpdateClaimStatus_InvalidTransition() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("APPROVED");
        assertThrows(RuntimeException.class, () -> claimService.updateClaimStatus(1L, dto));
    }

    @Test
    public void testUpdateClaimStatus_InvalidStatus() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("INVALID");
        assertThrows(RuntimeException.class, () -> claimService.updateClaimStatus(1L, dto));
    }

    @Test
    public void testUpdateClaimStatus_ApprovedToClosed() {
        Claim claim = new Claim();
        claim.setClaimStatus(ClaimStatus.APPROVED);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("CLOSED");
        claimService.updateClaimStatus(1L, dto);
        assertEquals(ClaimStatus.CLOSED, claim.getClaimStatus());
    }

    // ==================== getClaimsByUserId ====================
    @Test
    public void testGetClaimsByUserId() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(2L);
        claim.setUserId(1L);
        claim.setClaimAmount(100.0);
        claim.setDescription("Desc");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);

        when(claimRepository.findByUserId(1L)).thenReturn(Collections.singletonList(claim));

        List<ClaimResponseDTO> result = claimService.getClaimsByUserId(1L);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getClaimId());
        assertEquals("SUBMITTED", result.get(0).getStatus());
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

    // ==================== getAllClaims ====================
    @Test
    public void testGetAllClaims() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(2L);
        claim.setUserId(3L);
        claim.setClaimAmount(500.0);
        claim.setDescription("Desc");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);

        Page<Claim> page = new PageImpl<>(Collections.singletonList(claim));
        when(claimRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<ClaimResponseDTO> result = claimService.getAllClaims(PageRequest.of(0, 10));
        assertEquals(1, result.getContent().size());
        assertEquals("SUBMITTED", result.getContent().get(0).getStatus());
    }

    // ==================== updateClaim ====================
    @Test
    public void testUpdateClaim() {
        Claim existing = new Claim();
        existing.setId(1L);
        existing.setClaimAmount(100.0);
        existing.setDescription("Old");
        existing.setPolicyId(1L);
        existing.setUserId(1L);
        existing.setClaimStatus(ClaimStatus.SUBMITTED);

        ClaimRequestDTO dto = new ClaimRequestDTO();
        dto.setClaimAmount(200.0);
        dto.setDescription("New");
        dto.setPolicyId(2L);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(claimRepository.save(any(Claim.class))).thenReturn(existing);

        ClaimResponseDTO result = claimService.updateClaim(1L, dto);
        assertNotNull(result);
        assertEquals("Claim updated successfully by Admin", result.getMessage());
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

    @Test
    public void testDeleteClaim_NotFound() {
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ClaimNotFoundException.class, () -> claimService.deleteClaim(99L));
    }
}
