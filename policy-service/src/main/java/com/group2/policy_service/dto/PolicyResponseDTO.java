package com.group2.policy_service.dto;

public class PolicyResponseDTO {

    private Long id;
    private String policyName;
    private String description;
    private Double premiumAmount;
    private Double coverageAmount;
    private Integer durationInMonths;
    private String category;
    private Long policyTypeId;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getPolicyName() {
        return policyName;
    }
    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Double getPremiumAmount() {
        return premiumAmount;
    }
    public void setPremiumAmount(Double premiumAmount) {
        this.premiumAmount = premiumAmount;
    }
    public Double getCoverageAmount() {
        return coverageAmount;
    }
    public void setCoverageAmount(Double coverageAmount) {
        this.coverageAmount = coverageAmount;
    }
    public Integer getDurationInMonths() {
        return durationInMonths;
    }
    public void setDurationInMonths(Integer durationInMonths) {
        this.durationInMonths = durationInMonths;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public Long getPolicyTypeId() {
        return policyTypeId;
    }
    public void setPolicyTypeId(Long policyTypeId) {
        this.policyTypeId = policyTypeId;
    }
}
