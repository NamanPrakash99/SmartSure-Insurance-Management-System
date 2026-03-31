package com.group2.admin_service.controller;

import com.group2.admin_service.dto.*;
import com.group2.admin_service.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@org.springframework.test.context.ActiveProfiles("test")
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetReports() throws Exception {
        ReportResponse report = new ReportResponse();
        report.setTotalClaims(10);
        report.setTotalPolicies(20);

        when(adminService.getReports()).thenReturn(report);

        mockMvc.perform(get("/api/admin/reports")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(10))
                .andExpect(jsonPath("$.totalPolicies").value(20));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testReviewClaim() throws Exception {
        ReviewRequest request = new ReviewRequest();
        request.setStatus("APPROVED");

        mockMvc.perform(put("/api/admin/claims/1/review")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreatePolicy() throws Exception {
        PolicyRequestDTO request = new PolicyRequestDTO();
        PolicyDTO response = new PolicyDTO();
        response.setId(1L);

        when(adminService.createPolicy(any(PolicyRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/policies")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetStatus() throws Exception {
        ClaimStatusDTO dto = new ClaimStatusDTO();
        dto.setTotalClaims(5);
        when(adminService.getClaimStatus(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/admin/claims/status/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetClaimsByUser() throws Exception {
        when(adminService.getClaimsByUserId(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/claims/user/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDownloadDocument() throws Exception {
        byte[] content = new byte[] { 1, 2, 3 };
        when(adminService.downloadClaimDocument(1L)).thenReturn(org.springframework.http.ResponseEntity.ok(content));

        mockMvc.perform(get("/api/admin/claims/1/document")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(content));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllClaims() throws Exception {
        when(adminService.getAllClaims(0, 10)).thenReturn(new PageResponse<ClaimDTO>());

        mockMvc.perform(get("/api/admin/claims")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateClaim() throws Exception {
        ClaimDTO dto = new ClaimDTO();
        when(adminService.updateClaim(eq(1L), any(ClaimDTO.class))).thenReturn(dto);

        mockMvc.perform(put("/api/admin/claims/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteClaim() throws Exception {
        mockMvc.perform(delete("/api/admin/claims/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                        .csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdatePolicy() throws Exception {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        when(adminService.updatePolicy(eq(1L), any(PolicyRequestDTO.class))).thenReturn(new PolicyDTO());

        mockMvc.perform(put("/api/admin/policies/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeletePolicy() throws Exception {
        mockMvc.perform(delete("/api/admin/policies/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                        .csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserPolicies() throws Exception {
        when(adminService.getUserPolicies(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllUserPolicies() throws Exception {
        when(adminService.getAllUserPolicies()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/all")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCancelUserPolicy() throws Exception {
        when(adminService.cancelPolicy(1L)).thenReturn(Collections.singletonMap("status", "cancelled"));

        mockMvc.perform(put("/api/admin/policies/1/cancel")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                        .csrf()))
                .andExpect(status().isOk());
    }
}
