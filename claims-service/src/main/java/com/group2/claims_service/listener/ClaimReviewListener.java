package com.group2.claims_service.listener;

import com.group2.claims_service.dto.ClaimReviewEvent;
import com.group2.claims_service.entity.ClaimStatus;

import com.group2.claims_service.repository.ClaimRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ClaimReviewListener {

    private final ClaimRepository claimRepository;

    public ClaimReviewListener(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    @RabbitListener(queues = "claim.review.queue")
    public void processClaimReview(ClaimReviewEvent event) {
        System.out.println("Processing Claim Review Event for Claim ID: " + event.getClaimId());
        
        claimRepository.findById(event.getClaimId()).ifPresent(claim -> {
            try {
                ClaimStatus newStatus = ClaimStatus.valueOf(event.getStatus());
                claim.setClaimStatus(newStatus);
                claimRepository.save(claim);
                System.out.println("Successfully updated Claim " + event.getClaimId() + " to " + newStatus);
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid status received in event: " + event.getStatus());
            }
        });
    }
}
