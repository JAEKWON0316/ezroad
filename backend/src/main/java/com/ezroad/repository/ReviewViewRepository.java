package com.ezroad.repository;

import com.ezroad.entity.ReviewView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ReviewViewRepository extends JpaRepository<ReviewView, Long> {
    
    // 24시간 내 동일 사용자의 조회 기록 확인
    @Query("SELECT rv FROM ReviewView rv WHERE rv.review.id = :reviewId " +
           "AND rv.viewerIdentifier = :viewerIdentifier " +
           "AND rv.viewedAt > :since")
    Optional<ReviewView> findRecentView(
            @Param("reviewId") Long reviewId,
            @Param("viewerIdentifier") String viewerIdentifier,
            @Param("since") LocalDateTime since
    );
    
    // 24시간 내 조회 여부 확인 (성능 최적화)
    @Query("SELECT COUNT(rv) > 0 FROM ReviewView rv WHERE rv.review.id = :reviewId " +
           "AND rv.viewerIdentifier = :viewerIdentifier " +
           "AND rv.viewedAt > :since")
    boolean existsRecentView(
            @Param("reviewId") Long reviewId,
            @Param("viewerIdentifier") String viewerIdentifier,
            @Param("since") LocalDateTime since
    );
    
    // 24시간 이상 지난 조회 기록 삭제 (배치/스케줄러용)
    @Modifying
    @Query("DELETE FROM ReviewView rv WHERE rv.viewedAt < :before")
    int deleteOldViews(@Param("before") LocalDateTime before);
}
