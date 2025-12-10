package com.ezroad.repository;

import com.ezroad.entity.MemberOAuth;
import com.ezroad.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberOAuthRepository extends JpaRepository<MemberOAuth, Long> {
    
    // provider + providerId로 조회 (소셜 로그인 시)
    Optional<MemberOAuth> findByProviderAndProviderId(Provider provider, String providerId);
    
    // 회원의 모든 소셜 연동 조회
    List<MemberOAuth> findByMemberId(Long memberId);
    
    // 회원 + provider로 조회 (특정 소셜 연동 확인)
    Optional<MemberOAuth> findByMemberIdAndProvider(Long memberId, Provider provider);
    
    // 회원의 특정 소셜 연동 삭제
    void deleteByMemberIdAndProvider(Long memberId, Provider provider);
    
    // provider + providerId 존재 여부
    boolean existsByProviderAndProviderId(Provider provider, String providerId);
}
