package com.group2.admin_service.listner;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.group2.admin_service.dto.ClaimCreatedEvent;

@Component
public class ClaimEventListener {

    private static final Logger logger = LoggerFactory.getLogger(ClaimEventListener.class);

    @RabbitListener(queues = "claim.created.queue")
    public void handleClaimCreated(ClaimCreatedEvent  claim) {
        logger.info("New Claim Received for User ID: {}", claim.getUserId());

        // You can store or notify admin dashboard
    }
}
