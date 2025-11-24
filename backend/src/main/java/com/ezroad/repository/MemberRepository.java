package com.ezroad.repository;

import com.ezroad.entity.Member;
import com.ezroad.entity.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByEmail(String email);
    
    Optional<Member> findByNickname(String nickname);
    
    boolean existsByEmail(String email);
    
    boolean existsByNickname(String nickname);
    
    Optional<Member> findByEmailAndDeletedAtIsNull(String email);
}
