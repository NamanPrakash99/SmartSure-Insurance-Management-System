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
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetReports() throws Exception {
        ReportResponse report = new ReportResponse();
        report.setTotalClaims(10);
        report.setTotalPolicies(20);

        when(adminService.getReports()).thenReturn(report);

        mockMvc.perform(get("/api/admin/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(10))
                .andExpect(jsonPath("$.totalPolicies").value(20));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testReviewClaim() throws Exception {
        ReviewRequest request = new ReviewRequest();
        request.setStatus("APPROVED");

        mockMvc.perform(put("/api/admin/claims/1/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCreatePolicy() throws Exception {
        PolicyRequestDTO request = new PolicyRequestDTO();
        PolicyDTO response = new PolicyDTO();
        response.setId(1L);

        when(adminService.createPolicy(any(PolicyRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetStatus() throws Exception {
        ClaimStatusDTO dto = new ClaimStatusDTO();
        dto.setTotalClaims(5);
        when(adminService.getClaimStatus(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/admin/claims/status/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClaims").value(5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetClaimsByUser() throws Exception {
        when(adminService.getClaimsByUserId(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/claims/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDownloadDocument() throws Exception {
        byte[] content = new byte[]{1, 2, 3};
        when(adminService.downloadClaimDocument(1L)).thenReturn(org.springframework.http.ResponseEntity.ok(content));

        mockMvc.perform(get("/api/admin/claims/1/document"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(content));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetAllClaims() throws Exception {
        when(adminService.getAllClaims(0, 10)).thenReturn(new PageResponse<ClaimDTO>());

        mockMvc.perform(get("/api/admin/claims")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdateClaim() throws Exception {
        ClaimDTO dto = new ClaimDTO();
        when(adminService.updateClaim(eq(1L), any(ClaimDTO.class))).thenReturn(dto);

        mockMvc.perform(put("/api/admin/claims/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeleteClaim() throws Exception {
        mockMvc.perform(delete("/api/admin/claims/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdatePolicy() throws Exception {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        when(adminService.updatePolicy(eq(1L), any(PolicyRequestDTO.class))).thenReturn(new PolicyDTO());

        mockMvc.perform(put("/api/admin/policies/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeletePolicy() throws Exception {
        mockMvc.perform(delete("/api/admin/policies/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetUserPolicies() throws Exception {
        when(adminService.getUserPolicies(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetAllUserPolicies() throws Exception {
        when(adminService.getAllUserPolicies()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/all"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCancelUserPolicy() throws Exception {
        when(adminService.cancelPolicy(1L)).thenReturn(new Object());

        mockMvc.perform(put("/api/admin/policies/1/cancel"))
                .andExpect(status().isOk());
    }
}
