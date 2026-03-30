package com.group2.auth_service.dto.event;

public class PaymentStatusEvent {
    private Long userPolicyId;
    private String paymentId;
    private String status;

    public PaymentStatusEvent() {}

    public Long getUserPolicyId() { return userPolicyId; }
    public void setUserPolicyId(Long userPolicyId) { this.userPolicyId = userPolicyId; }
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
