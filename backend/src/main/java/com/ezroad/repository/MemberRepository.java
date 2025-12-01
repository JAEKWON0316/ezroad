package com.ezroad.repository;

import com.ezroad.entity.Member;
import com.ezroad.entity.MemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByEmail(String email);
    
    Optional<Member> findByNickname(String nickname);
    
    boolean existsByEmail(String email);
    
    boolean existsByNickname(String nickname);
    
    Optional<Member> findByEmailAndDeletedAtIsNull(String email);
    
    // ==================== 관리자용 검색 ====================
    
    Page<Member> findByRole(MemberRole role, Pageable pageable);
    
    @Query("SELECT m FROM Member m WHERE (m.nickname LIKE %:keyword% OR m.email LIKE %:keyword2%)")
    Page<Member> findByNicknameContainingOrEmailContaining(
            @Param("keyword") String keyword, 
            @Param("keyword2") String keyword2, 
            Pageable pageable);
    
    @Query("SELECT m FROM Member m WHERE (m.nickname LIKE %:keyword% OR m.email LIKE %:keyword2%) AND m.role = :role")
    Page<Member> findByNicknameContainingOrEmailContainingAndRole(
            @Param("keyword") String keyword, 
            @Param("keyword2") String keyword2, 
            @Param("role") MemberRole role, 
            Pageable pageable);
    
    // ==================== 통계 ====================
    
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    Long countByRole(MemberRole role);
}
