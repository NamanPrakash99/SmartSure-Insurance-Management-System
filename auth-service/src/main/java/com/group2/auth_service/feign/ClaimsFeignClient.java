package com.group2.auth_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "claims-service")
public interface ClaimsFeignClient {
    @GetMapping("/claims/{claimId}")
    Map<String, Object> getClaimById(@PathVariable("claimId") Long claimId);
}
