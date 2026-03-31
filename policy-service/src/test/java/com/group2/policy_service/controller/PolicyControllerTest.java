package com.group2.policy_service.controller;

import com.group2.policy_service.dto.*;
import com.group2.policy_service.service.PolicyCommandService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PolicyCommandController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private com.group2.policy_service.security.JwtUtil jwtUtil;

    @MockitoBean
    private PolicyCommandService policyCommandService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCreatePolicy() throws Exception {
        PolicyRequestDTO request = new PolicyRequestDTO();
        request.setPolicyName("Health Policy");

        PolicyResponseDTO response = new PolicyResponseDTO();
        response.setId(1L);
        response.setPolicyName("Health Policy");

        when(policyCommandService.createPolicy(any(PolicyRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.policyName").value("Health Policy"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdatePolicy() throws Exception {
        PolicyRequestDTO request = new PolicyRequestDTO();
        request.setPolicyName("Updated Life Policy");

        PolicyResponseDTO response = new PolicyResponseDTO();
        response.setId(1L);
        response.setPolicyName("Updated Life Policy");

        when(policyCommandService.updatePolicy(anyLong(), any(PolicyRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/admin/policies/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("Updated Life Policy"));
    }
}
