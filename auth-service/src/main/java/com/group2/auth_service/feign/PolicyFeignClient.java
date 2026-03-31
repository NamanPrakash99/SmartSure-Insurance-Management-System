package com.group2.auth_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

import com.group2.auth_service.config.FeignConfig;

@FeignClient(name = "policy-service", configuration = FeignConfig.class)
public interface PolicyFeignClient {
    @GetMapping("/api/user-policy/{id}")
    Map<String, Object> getUserPolicyById(@PathVariable("id") Long id);
}
