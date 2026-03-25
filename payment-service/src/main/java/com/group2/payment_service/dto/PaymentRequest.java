package com.group2.payment_service.dto;

public class PaymentRequest {
    private Long userId;
    private Long policyId;
    private Long userPolicyId;
    private Double amount;

    public PaymentRequest() {
    }

    public PaymentRequest(Long userId, Long policyId, Long userPolicyId, Double amount) {
        this.userId = userId;
        this.policyId = policyId;
        this.userPolicyId = userPolicyId;
        this.amount = amount;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public Long getUserPolicyId() {
        return userPolicyId;
    }

    public void setUserPolicyId(Long userPolicyId) {
        this.userPolicyId = userPolicyId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
