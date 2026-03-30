package com.group2.auth_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "policy-service")
public interface PolicyFeignClient {
    @GetMapping("/api/user-policy/{id}")
    Map<String, Object> getUserPolicyById(@PathVariable("id") Long id);
}
