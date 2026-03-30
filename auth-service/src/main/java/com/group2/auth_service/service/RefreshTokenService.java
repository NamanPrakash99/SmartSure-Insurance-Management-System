package com.group2.auth_service.service;

import java.util.Optional;
import com.group2.auth_service.entity.RefreshToken;

public interface RefreshTokenService {
    Optional<RefreshToken> findByToken(String token);
    RefreshToken createRefreshToken(Long userId);
    RefreshToken verifyExpiration(RefreshToken token);
}
