package com.group2.auth_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

import com.group2.auth_service.config.FeignConfig;

@FeignClient(name = "claims-service", configuration = FeignConfig.class)
public interface ClaimsFeignClient {
    @GetMapping("/api/claims/{claimId}")
    Map<String, Object> getClaimById(@PathVariable("claimId") Long claimId);
}
