package com.group2.payment_service.service;

import com.group2.payment_service.dto.PaymentRequest;
import com.group2.payment_service.dto.PaymentResponse;
import com.group2.payment_service.dto.PaymentVerifyRequest;
import com.group2.payment_service.entity.Transaction;
import com.group2.payment_service.repository.PolicyRepository;
import com.group2.payment_service.repository.TransactionRepository;
import com.group2.payment_service.repository.UserRepository;
import com.group2.payment_service.service.impl.PaymentServiceImpl;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(paymentService, "razorpayKeyId", "test_id");
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "test_secret");
    }

    @Test
    public void testCreateOrder_Success() throws RazorpayException {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setPolicyId(1L);
        request.setAmount(1000.0);
        request.setUserPolicyId(1L);

        when(userRepository.existsById(1L)).thenReturn(true);
        when(policyRepository.existsById(1L)).thenReturn(true);

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class, (mock, context) -> {
            // We'll use reflection or direct assignment to avoid needing the exact OrdersClient class type at compile-time
            try {
                java.lang.reflect.Field ordersField = RazorpayClient.class.getDeclaredField("orders");
                ordersField.setAccessible(true);
                Object ordersMock = mock(ordersField.getType());
                Order order = mock(Order.class);
                when(order.get("id")).thenReturn("order_123");
                
                // Use reflection to find the create method
                java.lang.reflect.Method createMethod = ordersMock.getClass().getMethod("create", JSONObject.class);
                when(createMethod.invoke(ordersMock, any(JSONObject.class))).thenReturn(order);
                
                ordersField.set(mock, ordersMock);
            } catch (Exception e) {
                // Fallback to direct assignment if reflection is restricted
                mock.orders = mock(mock.orders.getClass()); 
            }
        })) {
            PaymentResponse response = paymentService.createOrder(request);

            assertNotNull(response);
            assertEquals("order_123", response.getOrderId());
            assertEquals("CREATED", response.getStatus());
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }
    }

    @Test
    public void testCreateOrder_UserNotFound() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);

        when(userRepository.existsById(1L)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.createOrder(request);
        });

        assertEquals("Invalid User ID: User does not exist.", exception.getMessage());
    }

    @Test
    public void testCreateOrder_PolicyNotFound() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setPolicyId(1L);

        when(userRepository.existsById(1L)).thenReturn(true);
        when(policyRepository.existsById(1L)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.createOrder(request);
        });

        assertEquals("Invalid Policy ID: Policy does not exist.", exception.getMessage());
    }

    @Test
    public void testVerifyPayment_Success() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_123");
        verifyRequest.setRazorpayPaymentId("pay_123");
        verifyRequest.setRazorpaySignature("sig_123");

        Transaction transaction = new Transaction();
        transaction.setUserPolicyId(1L);
        transaction.setRazorpayOrderId("order_123");

        when(transactionRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(transaction));

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            
            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(true);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Successful", result);
            assertEquals("SUCCESS", transaction.getStatus());
            verify(transactionRepository, times(1)).save(transaction);
            verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), (Object) any());
        }
    }

    @Test
    public void testVerifyPayment_Failed() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_123");

        Transaction transaction = new Transaction();
        transaction.setUserPolicyId(1L);
        transaction.setRazorpayOrderId("order_123");

        when(transactionRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(transaction));

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            
            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(false);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Failed", result);
            assertEquals("FAILED", transaction.getStatus());
            verify(transactionRepository, times(1)).save(transaction);
            verify(rabbitTemplate, times(1)).convertAndSend(anyString(), anyString(), (Object) any());
        }
    }
}

