package com.group2.claims_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserPolicyResponseDTO {
    private Long id;
    private Long userId;
    private String policyName;
    private String status;
    private Double premiumAmount;
    private Double coverageAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long policyId;
    private LocalDate nextPaymentDueDate;
}
