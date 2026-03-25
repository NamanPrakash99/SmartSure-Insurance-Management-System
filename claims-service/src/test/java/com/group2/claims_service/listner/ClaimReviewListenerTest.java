package com.group2.claims_service.listner;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.group2.claims_service.dto.ClaimReviewEvent;
import com.group2.claims_service.entity.Claim;
import com.group2.claims_service.entity.ClaimStatus;
import com.group2.claims_service.listener.ClaimReviewListener;
import com.group2.claims_service.repository.ClaimRepository;

@ExtendWith(MockitoExtension.class)
public class ClaimReviewListenerTest {

    @Mock
    private ClaimRepository claimRepository;

    @InjectMocks
    private ClaimReviewListener claimReviewListener;

    @Test
    void testProcessClaimReview_Success() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");

        Claim claim = new Claim();
        claim.setId(1L);
        claim.setClaimStatus(ClaimStatus.UNDER_REVIEW);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        claimReviewListener.processClaimReview(event);

        verify(claimRepository, times(1)).save(claim);
        assert claim.getClaimStatus() == ClaimStatus.APPROVED;
    }

    @Test
    void testProcessClaimReview_InvalidStatus() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("INVALID_STATUS");

        Claim claim = new Claim();
        claim.setId(1L);
        claim.setClaimStatus(ClaimStatus.UNDER_REVIEW);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        claimReviewListener.processClaimReview(event);

        verify(claimRepository, never()).save(claim);
        assert claim.getClaimStatus() == ClaimStatus.UNDER_REVIEW;
    }
}
