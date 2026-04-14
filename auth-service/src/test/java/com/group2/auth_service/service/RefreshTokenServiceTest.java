package com.group2.auth_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.group2.auth_service.entity.RefreshToken;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.RefreshTokenRepository;
import com.group2.auth_service.service.impl.RefreshTokenServiceImpl;

@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthServiceRepository userRepository;

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", 604800000L);
    }

    @Test
    void testCreateRefreshToken_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUser(user)).thenReturn(Optional.empty());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        RefreshToken result = refreshTokenService.createRefreshToken(userId);

        assertNotNull(result);
        assertEquals(user, result.getUser());
        assertNotNull(result.getToken());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void testVerifyExpiration_Valid() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().plusSeconds(100));

        RefreshToken result = refreshTokenService.verifyExpiration(token);

        assertEquals(token, result);
    }

    @Test
    void testVerifyExpiration_Expired() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().minusSeconds(100));

        assertThrows(RuntimeException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void testDeleteByUserId() {
        Long userId = 1L;
        User user = new User();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.deleteByUser(user)).thenReturn(1);

        int result = refreshTokenService.deleteByUserId(userId);

        assertEquals(1, result);
    }
}
