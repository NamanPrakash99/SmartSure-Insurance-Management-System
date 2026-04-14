package com.group2.admin_service.listner;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.group2.admin_service.dto.ClaimCreatedEvent;

@ExtendWith(MockitoExtension.class)
class ClaimEventListenerTest {

    @InjectMocks
    private ClaimEventListener claimEventListener;

    @Test
    void testHandleClaimCreated() {
        ClaimCreatedEvent event = new ClaimCreatedEvent();
        event.setUserId(1L);
        
        assertDoesNotThrow(() -> claimEventListener.handleClaimCreated(event));
    }
}
