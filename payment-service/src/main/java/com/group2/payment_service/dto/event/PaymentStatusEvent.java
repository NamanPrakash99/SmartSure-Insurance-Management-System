package com.group2.payment_service.dto.event;

import java.io.Serializable;

public class PaymentStatusEvent implements Serializable {
    private Long userPolicyId;
    private String paymentId;
    private String status; // SUCCESS, FAILED

    public PaymentStatusEvent() {}

    public PaymentStatusEvent(Long userPolicyId, String paymentId, String status) {
        this.userPolicyId = userPolicyId;
        this.paymentId = paymentId;
        this.status = status;
    }

    public Long getUserPolicyId() { return userPolicyId; }
    public void setUserPolicyId(Long userPolicyId) { this.userPolicyId = userPolicyId; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
