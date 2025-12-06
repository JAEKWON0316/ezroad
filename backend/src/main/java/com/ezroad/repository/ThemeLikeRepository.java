package com.ezroad.repository;

import com.ezroad.entity.ThemeLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ThemeLikeRepository extends JpaRepository<ThemeLike, Long> {

    // 특정 테마의 좋아요 수
    long countByThemeId(Long themeId);

    // 특정 회원이 테마에 좋아요 했는지 확인
    boolean existsByThemeIdAndMemberId(Long themeId, Long memberId);

    // 특정 회원이 좋아요한 테마 목록
    @Query("SELECT tl FROM ThemeLike tl JOIN FETCH tl.theme WHERE tl.member.id = :memberId ORDER BY tl.createdAt DESC")
    List<ThemeLike> findByMemberIdWithTheme(@Param("memberId") Long memberId);

    // 특정 테마와 회원의 좋아요 조회
    Optional<ThemeLike> findByThemeIdAndMemberId(Long themeId, Long memberId);

    // 특정 테마의 모든 좋아요 삭제 (테마 삭제 시)
    void deleteByThemeId(Long themeId);
}
