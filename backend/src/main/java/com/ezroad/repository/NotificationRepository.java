package com.ezroad.repository;

import com.ezroad.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 사용자의 알림 목록 (최신순)
    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);

    // 읽지 않은 알림 수
    long countByReceiverIdAndIsReadFalse(Long receiverId);

    // 읽지 않은 알림 목록
    Page<Notification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId, Pageable pageable);

    // 모든 알림 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiver.id = :receiverId AND n.isRead = false")
    int markAllAsRead(@Param("receiverId") Long receiverId);

    // 특정 알림 삭제
    void deleteByIdAndReceiverId(Long id, Long receiverId);

    // 오래된 알림 삭제 (30일 이상)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    int deleteOldNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
