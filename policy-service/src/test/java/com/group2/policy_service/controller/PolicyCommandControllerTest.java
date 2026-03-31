package com.group2.policy_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group2.policy_service.dto.PolicyRequestDTO;
import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.service.PolicyCommandService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PolicyCommandController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class PolicyCommandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private com.group2.policy_service.security.JwtUtil jwtUtil;

    @MockitoBean
    private PolicyCommandService policyCommandService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void testPurchasePolicy() throws Exception {
        UserPolicyResponseDTO response = new UserPolicyResponseDTO();
        response.setId(1L);
        when(policyCommandService.purchasePolicy(1L)).thenReturn(response);

        mockMvc.perform(post("/api/policies/purchase")
                .param("policyId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCreatePolicy() throws Exception {
        PolicyRequestDTO request = new PolicyRequestDTO();
        request.setPolicyName("Health");
        PolicyResponseDTO response = new PolicyResponseDTO();
        response.setPolicyName("Health");
        when(policyCommandService.createPolicy(any())).thenReturn(response);

        mockMvc.perform(post("/api/admin/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("Health"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdatePolicy() throws Exception {
        PolicyRequestDTO request = new PolicyRequestDTO();
        when(policyCommandService.updatePolicy(eq(1L), any())).thenReturn(new PolicyResponseDTO());

        mockMvc.perform(put("/api/admin/policies/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
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
    public void testCancelPolicy() throws Exception {
        when(policyCommandService.cancelPolicy(1L)).thenReturn(new UserPolicyResponseDTO());
        mockMvc.perform(put("/api/admin/policies/1/cancel"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testRenewPolicy() throws Exception {
        when(policyCommandService.renewPolicy(1L)).thenReturn(new UserPolicyResponseDTO());
        mockMvc.perform(post("/api/policies/renew/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testDeleteUserPolicy() throws Exception {
        mockMvc.perform(delete("/api/policies/1"))
                .andExpect(status().isOk());
    }
}
