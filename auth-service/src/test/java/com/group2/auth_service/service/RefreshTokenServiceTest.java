package com.group2.auth_service.service;

import com.group2.auth_service.entity.RefreshToken;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.RefreshTokenRepository;
import com.group2.auth_service.service.impl.RefreshTokenServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthServiceRepository userRepository;

    @Test
    public void testFindByToken() {
        RefreshToken rt = new RefreshToken();
        rt.setToken("token123");
        when(refreshTokenRepository.findByToken("token123")).thenReturn(Optional.of(rt));

        Optional<RefreshToken> result = refreshTokenService.findByToken("token123");
        assertTrue(result.isPresent());
        assertEquals("token123", result.get().getToken());
    }

    @Test
    public void testFindByToken_NotFound() {
        when(refreshTokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        Optional<RefreshToken> result = refreshTokenService.findByToken("missing");
        assertTrue(result.isEmpty());
    }

    @Test
    public void testVerifyExpiration_Valid() {
        RefreshToken rt = new RefreshToken();
        rt.setExpiryDate(Instant.now().plusSeconds(3600));

        RefreshToken result = refreshTokenService.verifyExpiration(rt);
        assertEquals(rt, result);
    }

    @Test
    public void testVerifyExpiration_Expired() {
        RefreshToken rt = new RefreshToken();
        rt.setExpiryDate(Instant.now().minusSeconds(3600));

        assertThrows(RuntimeException.class, () -> refreshTokenService.verifyExpiration(rt));
        verify(refreshTokenRepository, times(1)).delete(rt);
    }
}
