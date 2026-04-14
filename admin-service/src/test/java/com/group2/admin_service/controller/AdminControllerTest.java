package com.group2.admin_service.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group2.admin_service.dto.*;
import com.group2.admin_service.service.AdminService;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for unit testing endpoints
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testReviewClaim() throws Exception {
        ReviewRequest request = new ReviewRequest();
        request.setStatus("APPROVED");

        mockMvc.perform(put("/api/admin/claims/1/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Claim reviewed successfully"));

        verify(adminService).reviewClaim(eq(1L), any(ReviewRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetStatus() throws Exception {
        when(adminService.getClaimStatus(1L)).thenReturn(new ClaimStatusDTO());

        mockMvc.perform(get("/api/admin/claims/status/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetClaimsByUser() throws Exception {
        when(adminService.getClaimsByUserId(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/claims/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDownloadDocument() throws Exception {
        byte[] content = "test".getBytes();
        when(adminService.downloadClaimDocument(1L)).thenReturn(ResponseEntity.ok(content));

        mockMvc.perform(get("/api/admin/claims/1/document"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(content));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllClaims() throws Exception {
        when(adminService.getAllClaims(0, 10)).thenReturn(new PageResponse<>());

        mockMvc.perform(get("/api/admin/claims?page=0&size=10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllClaims_Error() throws Exception {
        when(adminService.getAllClaims(anyInt(), anyInt())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/api/admin/claims"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateClaim() throws Exception {
        ClaimDTO dto = new ClaimDTO();
        when(adminService.updateClaim(eq(1L), any(ClaimDTO.class))).thenReturn(dto);

        mockMvc.perform(put("/api/admin/claims/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateClaim_Error() throws Exception {
        when(adminService.updateClaim(anyLong(), any(ClaimDTO.class))).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(put("/api/admin/claims/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ClaimDTO())))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteClaim() throws Exception {
        mockMvc.perform(delete("/api/admin/claims/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Claim deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreatePolicy() throws Exception {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        when(adminService.createPolicy(any(PolicyRequestDTO.class))).thenReturn(new PolicyDTO());

        mockMvc.perform(post("/api/admin/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdatePolicy() throws Exception {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        when(adminService.updatePolicy(eq(1L), any(PolicyRequestDTO.class))).thenReturn(new PolicyDTO());

        mockMvc.perform(put("/api/admin/policies/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeletePolicy() throws Exception {
        mockMvc.perform(delete("/api/admin/policies/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Policy deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserPolicies() throws Exception {
        when(adminService.getUserPolicies(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllUserPolicies() throws Exception {
        when(adminService.getAllUserPolicies()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/all"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCancelUserPolicy() throws Exception {
        when(adminService.cancelPolicy(1L)).thenReturn(Collections.singletonMap("status", "cancelled"));

        mockMvc.perform(put("/api/admin/policies/1/cancel"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllCustomers() throws Exception {
        when(adminService.getAllCustomers()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/customers"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetReports() throws Exception {
        when(adminService.getReports()).thenReturn(new ReportResponse());

        mockMvc.perform(get("/api/admin/reports"))
                .andExpect(status().isOk());
    }
}
