package com.group2.payment_service.service;

import com.group2.payment_service.dto.PaymentRequest;
import com.group2.payment_service.dto.PaymentResponse;
import com.group2.payment_service.dto.PaymentVerifyRequest;
import com.group2.payment_service.entity.Policy;
import com.group2.payment_service.entity.Transaction;
import com.group2.payment_service.entity.User;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PaymentServiceTest {

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

    @Mock
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "razorpayKeyId", "test_id");
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "test_secret");
    }

    // ==================== createOrder ====================

    @Test
    @DisplayName("Should create Razorpay order successfully")
    void testCreateOrder_Success() throws RazorpayException {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setPolicyId(1L);
        request.setAmount(1000.0);
        request.setUserPolicyId(1L);

        when(userRepository.existsById(1L)).thenReturn(true);
        when(policyRepository.existsById(1L)).thenReturn(true);

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class, (mock, context) -> {
            try {
                java.lang.reflect.Field ordersField = RazorpayClient.class.getDeclaredField("orders");
                ordersField.setAccessible(true);
                Object ordersMock = mock(ordersField.getType());
                Order order = mock(Order.class);
                when(order.get("id")).thenReturn("order_123");
                java.lang.reflect.Method createMethod = ordersMock.getClass().getMethod("create", JSONObject.class);
                when(createMethod.invoke(ordersMock, any(JSONObject.class))).thenReturn(order);
                ordersField.set(mock, ordersMock);
            } catch (Exception e) {
                // Fallback
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
    @DisplayName("Should throw IllegalArgumentException when user does not exist")
    void testCreateOrder_UserNotFound() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);

        when(userRepository.existsById(1L)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                paymentService.createOrder(request));

        assertEquals("Invalid User ID: User does not exist.", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when policy does not exist")
    void testCreateOrder_PolicyNotFound() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setPolicyId(1L);

        when(userRepository.existsById(1L)).thenReturn(true);
        when(policyRepository.existsById(1L)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                paymentService.createOrder(request));

        assertEquals("Invalid Policy ID: Policy does not exist.", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw RuntimeException when RazorpayException occurs during order creation")
    void testCreateOrder_RazorpayException() {
        PaymentRequest request = new PaymentRequest();
        request.setUserId(1L);
        request.setPolicyId(1L);
        request.setAmount(1000.0);
        request.setUserPolicyId(1L);

        when(userRepository.existsById(1L)).thenReturn(true);
        when(policyRepository.existsById(1L)).thenReturn(true);

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class, (mock, context) -> {
            try {
                java.lang.reflect.Field ordersField = RazorpayClient.class.getDeclaredField("orders");
                ordersField.setAccessible(true);
                Object ordersMock = mock(ordersField.getType());
                java.lang.reflect.Method createMethod = ordersMock.getClass().getMethod("create", JSONObject.class);
                when(createMethod.invoke(ordersMock, any(JSONObject.class)))
                        .thenThrow(new RuntimeException(new RazorpayException("API error")));
                ordersField.set(mock, ordersMock);
            } catch (Exception e) {
                // ignore
            }
        })) {
            assertThrows(RuntimeException.class, () -> paymentService.createOrder(request));
        }
    }

    // ==================== verifyPayment ====================

    @Test
    @DisplayName("Should return success when payment signature is valid and transaction exists")
    void testVerifyPayment_Success() {
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
    @DisplayName("Should return success but not emit event when userPolicyId is null")
    void testVerifyPayment_SuccessNullUserPolicyId() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_456");
        verifyRequest.setRazorpayPaymentId("pay_456");
        verifyRequest.setRazorpaySignature("sig_456");

        Transaction transaction = new Transaction();
        transaction.setUserPolicyId(null); // null → emitPaymentStatus does nothing
        transaction.setRazorpayOrderId("order_456");

        when(transactionRepository.findByRazorpayOrderId("order_456")).thenReturn(Optional.of(transaction));

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(true);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Successful", result);
            assertEquals("SUCCESS", transaction.getStatus());
            // rabbitTemplate should NOT be called since userPolicyId is null
            verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), (Object) any());
        }
    }

    @Test
    @DisplayName("Should return success when valid signature but no transaction found in DB")
    void testVerifyPayment_SuccessNoTransaction() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_unknown");
        verifyRequest.setRazorpayPaymentId("pay_unknown");
        verifyRequest.setRazorpaySignature("sig_unknown");

        when(transactionRepository.findByRazorpayOrderId("order_unknown")).thenReturn(Optional.empty());

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(true);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Successful", result);
            verify(transactionRepository, never()).save(any());
            verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), (Object) any());
        }
    }

    @Test
    @DisplayName("Should return failure when signature is invalid and transaction exists")
    void testVerifyPayment_Failed() {
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

    @Test
    @DisplayName("Should return failure and not save when invalid signature and no transaction found")
    void testVerifyPayment_FailedNoTransaction() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_none");

        when(transactionRepository.findByRazorpayOrderId("order_none")).thenReturn(Optional.empty());

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(false);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Failed", result);
            verify(transactionRepository, never()).save(any());
            verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), (Object) any());
        }
    }

    @Test
    @DisplayName("Should throw RuntimeException when RazorpayException occurs during payment verification")
    void testVerifyPayment_RazorpayException() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_err");
        verifyRequest.setRazorpayPaymentId("pay_err");
        verifyRequest.setRazorpaySignature("sig_err");

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString()))
                    .thenThrow(new RazorpayException("Signature verification error"));

            assertThrows(RuntimeException.class, () -> paymentService.verifyPayment(verifyRequest));
        }
    }

    @Test
    @DisplayName("Should send confirmation email when payment succeeds with user and policy found")
    void testVerifyPayment_SuccessWithEmail() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_123");
        verifyRequest.setRazorpayPaymentId("pay_123");
        verifyRequest.setRazorpaySignature("sig_123");

        Transaction transaction = new Transaction();
        transaction.setUserId(1L);
        transaction.setPolicyId(1L);
        transaction.setUserPolicyId(1L);
        transaction.setRazorpayOrderId("order_123");
        transaction.setAmount(100.0);

        User user = new User();
        user.setName("Test User");
        user.setEmail("test@test.com");

        Policy policy = new Policy();
        policy.setPolicyName("Test Policy");
        policy.setCoverageAmount(10000.0);

        when(transactionRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(transaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(true);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Successful", result);
            verify(emailService, times(1)).sendHtmlEmail(anyString(), anyString(), anyString());
        }
    }

    @Test
    @DisplayName("Should succeed without email when user is not found in DB")
    void testVerifyPayment_SuccessEmailUserNotFound() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_789");
        verifyRequest.setRazorpayPaymentId("pay_789");
        verifyRequest.setRazorpaySignature("sig_789");

        Transaction transaction = new Transaction();
        transaction.setUserId(99L); // non-existent user
        transaction.setPolicyId(1L);
        transaction.setUserPolicyId(1L);
        transaction.setRazorpayOrderId("order_789");

        when(transactionRepository.findByRazorpayOrderId("order_789")).thenReturn(Optional.of(transaction));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(true);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Successful", result);
            // email should NOT be sent since user is not found
            verify(emailService, never()).sendHtmlEmail(anyString(), anyString(), anyString());
        }
    }

    @Test
    @DisplayName("Should succeed without email when policy is not found in DB")
    void testVerifyPayment_SuccessEmailPolicyNotFound() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_321");
        verifyRequest.setRazorpayPaymentId("pay_321");
        verifyRequest.setRazorpaySignature("sig_321");

        Transaction transaction = new Transaction();
        transaction.setUserId(1L);
        transaction.setPolicyId(99L); // non-existent policy
        transaction.setUserPolicyId(1L);
        transaction.setRazorpayOrderId("order_321");

        User user = new User();
        user.setName("Test User");
        user.setEmail("test@test.com");

        when(transactionRepository.findByRazorpayOrderId("order_321")).thenReturn(Optional.of(transaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(true);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Successful", result);
            // email should NOT be sent since policy is not found
            verify(emailService, never()).sendHtmlEmail(anyString(), anyString(), anyString());
        }
    }

    @Test
    @DisplayName("Should fail payment and not emit event when userPolicyId is null on failure")
    void testVerifyPayment_FailedNullUserPolicyId() {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest();
        verifyRequest.setRazorpayOrderId("order_fail_null");

        Transaction transaction = new Transaction();
        transaction.setUserPolicyId(null); // null → no rabbit emit
        transaction.setRazorpayOrderId("order_fail_null");

        when(transactionRepository.findByRazorpayOrderId("order_fail_null")).thenReturn(Optional.of(transaction));

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {

            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(JSONObject.class), anyString())).thenReturn(false);

            String result = paymentService.verifyPayment(verifyRequest);

            assertEquals("Payment Verification Failed", result);
            assertEquals("FAILED", transaction.getStatus());
            // rabbitTemplate should NOT be called since userPolicyId is null
            verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), (Object) any());
        }
    }

    @Test
    @DisplayName("Should handle email service exception during verification")
    void testVerifyPayment_EmailExceptionDuringVerification() throws Exception {
        PaymentVerifyRequest verifyRequest = new PaymentVerifyRequest("order_email_fail", "pay_email_fail", "sig_email_fail");
        Transaction transaction = new Transaction();
        transaction.setUserId(1L);
        transaction.setPolicyId(1L);
        transaction.setRazorpayOrderId("order_email_fail");

        when(transactionRepository.findByRazorpayOrderId("order_email_fail")).thenReturn(Optional.of(transaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(policyRepository.findById(1L)).thenReturn(Optional.of(new com.group2.payment_service.entity.Policy()));
        doThrow(new RuntimeException("Mail server down")).when(emailService).sendHtmlEmail(any(), any(), any());

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class);
             MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.verifyPaymentSignature(any(), anyString())).thenReturn(true);
            String result = paymentService.verifyPayment(verifyRequest);
            assertEquals("Payment Verification Successful", result);
        }
    }
}
