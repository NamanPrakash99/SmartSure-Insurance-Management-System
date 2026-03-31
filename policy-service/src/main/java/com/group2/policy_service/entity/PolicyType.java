package com.group2.policy_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.SequenceGenerator;

@Entity
@Table(name = "policy_types")
public class PolicyType {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "policy_type_seq")
    @SequenceGenerator(name = "policy_type_seq", sequenceName = "policy_type_sequence", allocationSize = 1)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PolicyCategory category;

    private String description;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public PolicyCategory getCategory() {
		return category;
	}

	public void setCategory(PolicyCategory category) {
		this.category = category;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

    
}
