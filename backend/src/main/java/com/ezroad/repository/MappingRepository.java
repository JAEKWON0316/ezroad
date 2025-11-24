package com.ezroad.repository;

import com.ezroad.entity.Mapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MappingRepository extends JpaRepository<Mapping, Long> {
    
    List<Mapping> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    Page<Mapping> findByMemberId(Long memberId, Pageable pageable);
}
