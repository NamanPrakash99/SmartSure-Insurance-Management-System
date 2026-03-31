package com.group2.policy_service.controller;

import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.PolicyStatsDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.entity.PolicyType;
import com.group2.policy_service.service.PolicyQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PolicyQueryController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class PolicyQueryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private com.group2.policy_service.security.JwtUtil jwtUtil;

    @MockitoBean
    private PolicyQueryService policyQueryService;

    @Test
    @WithMockUser
    public void testGetAllPolicies() throws Exception {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setPolicyName("Health");
        when(policyQueryService.getAllPolicies()).thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].policyName").value("Health"));
    }

    @Test
    @WithMockUser
    public void testGetAllPolicyTypes() throws Exception {
        when(policyQueryService.getAllPolicyTypes()).thenReturn(Collections.singletonList(new PolicyType()));
        mockMvc.perform(get("/api/policy-types"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testGetPolicy() throws Exception {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setId(1L);
        when(policyQueryService.getPolicyById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/policies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetUserPolicies() throws Exception {
        when(policyQueryService.getPoliciesByUserId(anyLong())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testGetAllUserPolicies() throws Exception {
        when(policyQueryService.getAllUserPolicies()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/user-policies/all"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testGetPolicyStats() throws Exception {
        PolicyStatsDTO stats = new PolicyStatsDTO();
        stats.setTotalPolicies(10L);
        when(policyQueryService.getPolicyStats()).thenReturn(stats);

        mockMvc.perform(get("/api/admin/policies/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPolicies").value(10L));
    }
}
