package com.group2.claims_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.group2.claims_service.dto.UserPolicyResponseDTO;

@FeignClient(name = "policy-service")
public interface PolicyClient {
    @GetMapping("/api/user-policy/{id}")
    UserPolicyResponseDTO getUserPolicyById(
        @PathVariable("id") Long id,
        @org.springframework.web.bind.annotation.RequestHeader("X-Gateway-Secret") String gatewaySecret
    );
}
