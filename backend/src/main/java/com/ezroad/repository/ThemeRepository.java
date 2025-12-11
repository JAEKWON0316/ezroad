package com.ezroad.repository;

import com.ezroad.entity.Theme;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ThemeRepository extends JpaRepository<Theme, Long> {

    // ==================== N+1 최적화 쿼리 ====================
    
    // 내 테마 목록 (member 불필요 - 본인 것)
    Page<Theme> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
    
    List<Theme> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    // 공개 테마 목록 (member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    Page<Theme> findByIsPublicTrue(Pageable pageable);
    
    // 공개 테마 목록 (최신순, member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    Page<Theme> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);

    // 공개 테마 검색 (member 함께 로딩)
    @Query("SELECT t FROM Theme t JOIN FETCH t.member WHERE t.isPublic = true AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Theme> searchPublicThemes(@Param("keyword") String keyword, Pageable pageable);

    // 인기 테마 TOP 3 (조회수 기준, member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    List<Theme> findTop3ByIsPublicTrueOrderByViewCountDesc();
    
    // 인기 테마 TOP 3 (좋아요 기준, member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    List<Theme> findTop3ByIsPublicTrueOrderByLikeCountDesc();

    // 테마 상세 (식당 목록 함께 조회)
    @Query("SELECT t FROM Theme t " +
           "LEFT JOIN FETCH t.member " +
           "LEFT JOIN FETCH t.themeRestaurants tr " +
           "LEFT JOIN FETCH tr.restaurant " +
           "WHERE t.id = :id")
    Optional<Theme> findByIdWithRestaurants(@Param("id") Long id);

    // 내 테마인지 확인
    boolean existsByIdAndMemberId(Long id, Long memberId);
}
