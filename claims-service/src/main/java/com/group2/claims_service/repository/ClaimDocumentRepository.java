package com.group2.claims_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.group2.claims_service.entity.ClaimDocument;

import java.util.Optional;

public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long>{
	java.util.Optional<ClaimDocument> findFirstByClaimIdOrderByIdDesc(Long claimId);
	void deleteByClaimId(Long claimId);

}
