package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_receiver", columnList = "receiver_id"),
    @Index(name = "idx_notification_read", columnList = "receiver_id, is_read"),
    @Index(name = "idx_notification_created", columnList = "created_at DESC")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림 받는 사람
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Member receiver;

    // 알림 보낸 사람 (시스템 알림일 경우 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private Member sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // 알림 제목
    @Column(nullable = false)
    private String title;

    // 알림 내용
    @Column(nullable = false, length = 500)
    private String message;

    // 연관 데이터 (예약ID, 대기ID, 식당ID 등)
    private Long referenceId;

    // 연관 데이터 타입 (RESERVATION, WAITING, RESTAURANT, REVIEW 등)
    private String referenceType;

    // 클릭 시 이동할 URL
    private String linkUrl;

    // 읽음 여부
    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 읽음 처리
    public void markAsRead() {
        this.isRead = true;
    }
}
