package com.group2.payment_service;

import com.group2.payment_service.config.RabbitConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class ApplicationInfrastructureTest {

    @Test
    @DisplayName("Should instantiate PaymentServiceApplication")
    void testApplicationMain() {
        PaymentServiceApplication app = new PaymentServiceApplication();
        assertNotNull(app);
    }

    @Test
    @DisplayName("Should create DirectExchange bean")
    void testRabbitConfig_Exchange() {
        RabbitConfig config = new RabbitConfig();
        DirectExchange exchange = config.exchange();
        assertNotNull(exchange);
        assertEquals(RabbitConfig.EXCHANGE, exchange.getName());
    }

    @Test
    @DisplayName("Should create purchaseQueue bean")
    void testRabbitConfig_PurchaseQueue() {
        RabbitConfig config = new RabbitConfig();
        Queue queue = config.purchaseQueue();
        assertNotNull(queue);
        assertEquals(RabbitConfig.PURCHASE_QUEUE, queue.getName());
    }

    @Test
    @DisplayName("Should create RabbitTemplate")
    void testRabbitConfig_Template() {
        RabbitConfig config = new RabbitConfig();
        ConnectionFactory mockFactory = mock(ConnectionFactory.class);
        AmqpTemplate template = config.template(mockFactory);
        assertNotNull(template);
    }
}
