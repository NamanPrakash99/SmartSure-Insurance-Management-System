package com.group2.admin_service.listner;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.group2.admin_service.dto.ClaimCreatedEvent;

@ExtendWith(MockitoExtension.class)
public class ClaimEventListenerTest {

    @InjectMocks
    private ClaimEventListener claimEventListener;

    @Test
    void testHandleClaimCreated() {
        ClaimCreatedEvent event = new ClaimCreatedEvent();
        event.setUserId(1L);
        
        claimEventListener.handleClaimCreated(event);
        // Method only logs, so we just ensure it doesn't throw
    }
}
