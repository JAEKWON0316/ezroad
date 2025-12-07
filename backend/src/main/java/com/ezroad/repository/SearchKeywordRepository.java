package com.ezroad.repository;

import com.ezroad.entity.SearchKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SearchKeywordRepository extends JpaRepository<SearchKeyword, Long> {

    // 키워드로 조회
    Optional<SearchKeyword> findByKeyword(String keyword);

    // 인기 검색어 TOP N (검색 횟수 기준)
    List<SearchKeyword> findTop10ByOrderBySearchCountDesc();

    // 최근 검색어 TOP N
    List<SearchKeyword> findTop10ByOrderByLastSearchedAtDesc();

    // 검색 횟수 증가
    @Modifying
    @Query("UPDATE SearchKeyword s SET s.searchCount = s.searchCount + 1, s.lastSearchedAt = CURRENT_TIMESTAMP WHERE s.keyword = :keyword")
    int incrementSearchCount(@Param("keyword") String keyword);

    // 키워드 존재 여부
    boolean existsByKeyword(String keyword);

    // 키워드 삭제 (관리자용)
    void deleteByKeyword(String keyword);
}
