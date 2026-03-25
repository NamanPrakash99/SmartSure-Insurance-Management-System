package com.group2.payment_service.dto.event;

import java.io.Serializable;

public class PolicyPurchaseEvent implements Serializable {
    private Long userPolicyId;
    private Long userId;
    private Long policyId;
    private Double amount;

    public PolicyPurchaseEvent() {}

    public PolicyPurchaseEvent(Long userPolicyId, Long userId, Long policyId, Double amount) {
        this.userPolicyId = userPolicyId;
        this.userId = userId;
        this.policyId = policyId;
        this.amount = amount;
    }

    public Long getUserPolicyId() { return userPolicyId; }
    public void setUserPolicyId(Long userPolicyId) { this.userPolicyId = userPolicyId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getPolicyId() { return policyId; }
    public void setPolicyId(Long policyId) { this.policyId = policyId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}
