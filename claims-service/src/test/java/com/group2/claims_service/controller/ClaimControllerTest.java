package com.group2.claims_service.controller;

import com.group2.claims_service.dto.*;
import com.group2.claims_service.entity.ClaimDocument;
import com.group2.claims_service.service.ClaimService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClaimController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private com.group2.claims_service.security.JwtUtil jwtUtil;

    @MockitoBean
    private ClaimService claimService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void testInitiateClaim() throws Exception {
        ClaimRequestDTO request = new ClaimRequestDTO();
        request.setClaimAmount(100.0);

        ClaimResponseDTO response = new ClaimResponseDTO();
        response.setClaimId(1L);
        response.setStatus("SUBMITTED");

        when(claimService.initiateClaim(any(ClaimRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/claims/initiate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimId").value(1L))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    @WithMockUser
    public void testGetClaimStatus() throws Exception {
        ClaimResponseDTO response = new ClaimResponseDTO();
        response.setClaimId(1L);
        response.setStatus("UNDER_REVIEW");

        when(claimService.getClaimStatus(1L)).thenReturn(response);

        mockMvc.perform(get("/api/claims/status/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));
    }

    @Test
    @WithMockUser
    public void testGetClaimById() throws Exception {
        ClaimResponseDTO response = new ClaimResponseDTO();
        response.setClaimId(1L);
        response.setStatus("SUBMITTED");

        when(claimService.getClaimById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/claims/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimId").value(1L));
    }

    @Test
    @WithMockUser
    public void testGetClaimsByUserId() throws Exception {
        when(claimService.getClaimsByUserId(anyLong())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/claims/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdateClaim() throws Exception {
        ClaimRequestDTO dto = new ClaimRequestDTO();
        when(claimService.updateClaim(eq(1L), any(ClaimRequestDTO.class))).thenReturn(new ClaimResponseDTO());

        mockMvc.perform(put("/api/claims/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testUpdateClaimStatus() throws Exception {
        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("UNDER_REVIEW");

        mockMvc.perform(put("/api/claims/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeleteClaim() throws Exception {
        mockMvc.perform(delete("/api/claims/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testGetClaimStats() throws Exception {
        ClaimStatsDTO stats = new ClaimStatsDTO();
        stats.setTotalClaims(10);
        when(claimService.getClaimStats()).thenReturn(stats);

        mockMvc.perform(get("/api/claims/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(10));
    }

    @Test
    @WithMockUser
    public void testDownloadDocument() throws Exception {
        ClaimDocument doc = new ClaimDocument();
        doc.setFileData(new byte[]{1, 2, 3});
        doc.setDocumentType("application/pdf");
        doc.setFileUrl("test.pdf");
        when(claimService.getClaimDocument(1L)).thenReturn(doc);

        mockMvc.perform(get("/api/claims/1/document"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetAllClaims() throws Exception {
        when(claimService.getAllClaims(any())).thenReturn(new PageImpl<>(Collections.emptyList()));

        mockMvc.perform(get("/api/claims/admin/all")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }
}
