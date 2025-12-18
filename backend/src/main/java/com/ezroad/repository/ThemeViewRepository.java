package com.ezroad.repository;

import com.ezroad.entity.ThemeView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ThemeViewRepository extends JpaRepository<ThemeView, Long> {

    // 최근 조회 기록 존재 여부 확인
    @Query("SELECT CASE WHEN COUNT(tv) > 0 THEN true ELSE false END " +
           "FROM ThemeView tv " +
           "WHERE tv.theme.id = :themeId " +
           "AND tv.viewerIdentifier = :viewerIdentifier " +
           "AND tv.viewedAt > :since")
    boolean existsRecentView(@Param("themeId") Long themeId,
                             @Param("viewerIdentifier") String viewerIdentifier,
                             @Param("since") LocalDateTime since);

    // 최근 조회 기록 조회
    @Query("SELECT tv FROM ThemeView tv " +
           "WHERE tv.theme.id = :themeId " +
           "AND tv.viewerIdentifier = :viewerIdentifier " +
           "AND tv.viewedAt > :since")
    Optional<ThemeView> findRecentView(@Param("themeId") Long themeId,
                                       @Param("viewerIdentifier") String viewerIdentifier,
                                       @Param("since") LocalDateTime since);

    // 오래된 조회 기록 삭제 (스케줄러용)
    @Modifying
    @Query("DELETE FROM ThemeView tv WHERE tv.viewedAt < :before")
    int deleteOldViews(@Param("before") LocalDateTime before);
}
