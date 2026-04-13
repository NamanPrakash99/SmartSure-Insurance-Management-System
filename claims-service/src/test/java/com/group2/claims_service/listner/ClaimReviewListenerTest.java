package com.group2.claims_service.listner;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.group2.claims_service.dto.ClaimReviewEvent;
import com.group2.claims_service.dto.ClaimStatusUpdateDTO;
import com.group2.claims_service.listener.ClaimReviewListener;
import com.group2.claims_service.service.ClaimService;

@ExtendWith(MockitoExtension.class)
public class ClaimReviewListenerTest {

    @Mock
    private ClaimService claimService;

    @InjectMocks
    private ClaimReviewListener claimReviewListener;

    @Test
    void testProcessClaimReview_Success() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");
        event.setRemark("All good");

        claimReviewListener.processClaimReview(event);

        verify(claimService, times(1)).updateClaimStatus(eq(1L), any(ClaimStatusUpdateDTO.class));
    }

    @Test
    void testProcessClaimReview_Exception() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("INVALID");

        doThrow(new RuntimeException("Invalid status")).when(claimService).updateClaimStatus(eq(1L), any(ClaimStatusUpdateDTO.class));

        // Should not throw exception as it's caught in try-catch in implementation
        assertDoesNotThrow(() -> claimReviewListener.processClaimReview(event));
    }
}
