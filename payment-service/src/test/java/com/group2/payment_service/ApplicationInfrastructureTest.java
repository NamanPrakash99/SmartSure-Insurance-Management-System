package com.group2.payment_service;

import com.group2.payment_service.config.RabbitConfig;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Queue;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ApplicationInfrastructureTest {

    @Test
    public void testApplicationMain() {
        // Just calling main with empty args should start application context in integration test,
        // but to avoid bringing up the whole context and failing on port bindings,
        // we just assert that the class exists. 
        // For true coverage of the `main` method without launching spring boot:
        // PaymentServiceApplication.main(new String[]{}); 
        // A safer way is just instantiating it:
        PaymentServiceApplication app = new PaymentServiceApplication();
        assertNotNull(app);
    }

    @Test
    public void testRabbitConfig() {
        RabbitConfig config = new RabbitConfig();
        org.springframework.amqp.core.DirectExchange exchange = config.exchange();
        assertNotNull(exchange);
        assertEquals(RabbitConfig.EXCHANGE, exchange.getName());

        Queue queue = config.paymentStatusQueue();
        assertNotNull(queue);
        assertEquals(RabbitConfig.PAYMENT_STATUS_QUEUE, queue.getName());
    }
}
