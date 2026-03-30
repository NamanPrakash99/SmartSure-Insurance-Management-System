package com.group2.admin_service.service;

import java.util.List;
import org.springframework.http.ResponseEntity;
import com.group2.admin_service.dto.*;

public interface AdminService {
    List<UserDTO> getAllCustomers();
    void reviewClaim(Long claimId, ReviewRequest request);
    ClaimStatusDTO getClaimStatus(Long claimId);
    List<ClaimDTO> getClaimsByUserId(Long userId);
    ResponseEntity<byte[]> downloadClaimDocument(Long claimId);
    PageResponse<ClaimDTO> getAllClaims(int page, int size);
    ClaimDTO updateClaim(Long id, ClaimDTO dto);
    PolicyDTO createPolicy(PolicyRequestDTO dto);
    PolicyDTO updatePolicy(Long id, PolicyRequestDTO dto);
    void deletePolicy(Long id);
    List<Object> getUserPolicies(Long userId);
    List<Object> getAllUserPolicies();
    Object cancelPolicy(Long id);
    ReportResponse getReports();
    void deleteClaim(Long id);
}
