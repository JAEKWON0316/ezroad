package com.ezroad.service;

import com.ezroad.dto.response.NotificationResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Notification;
import com.ezroad.entity.NotificationType;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 휘발성 알림 타입 (DB에 저장하지 않음)
    private static final Set<NotificationType> VOLATILE_TYPES = Set.of(
        NotificationType.WAITING_QUEUE_UPDATE,
        NotificationType.WAITING_COUNT_UPDATE
    );

    /**
     * 알림 생성 및 전송
     */
    @Transactional
    public void sendNotification(
            Long receiverId,
            Long senderId,
            NotificationType type,
            String title,
            String message,
            Long referenceId,
            String referenceType,
            String linkUrl
    ) {
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("수신자를 찾을 수 없습니다"));

        Member sender = null;
        if (senderId != null) {
            sender = memberRepository.findById(senderId).orElse(null);
        }

        // 휘발성 알림이 아닌 경우에만 DB 저장
        Notification notification = null;
        if (!VOLATILE_TYPES.contains(type)) {
            notification = Notification.builder()
                    .receiver(receiver)
                    .sender(sender)
                    .type(type)
                    .title(title)
                    .message(message)
                    .referenceId(referenceId)
                    .referenceType(referenceType)
                    .linkUrl(linkUrl)
                    .build();
            notification = notificationRepository.save(notification);
            log.info("알림 저장 - receiver: {}, type: {}", receiverId, type);
        }

        // WebSocket으로 실시간 전송
        NotificationResponse response = NotificationResponse.builder()
                .id(notification != null ? notification.getId() : null)
                .type(type.name())
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .linkUrl(linkUrl)
                .isRead(false)
                .createdAt(java.time.LocalDateTime.now().toString())
                .build();

        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/notifications",
                response
        );
        log.info("알림 전송 - receiver: {}, type: {}", receiverId, type);
    }

    /**
     * 휘발성 알림 전송 (DB 저장 없이)
     */
    public void sendVolatileNotification(Long receiverId, NotificationType type, Object data) {
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/notifications",
                data
        );
    }

    /**
     * 특정 토픽으로 브로드캐스트 (대기열 순번 등)
     */
    public void broadcastToTopic(String topic, Object data) {
        messagingTemplate.convertAndSend("/topic/" + topic, data);
    }

    /**
     * 알림 목록 조회
     */
    public Page<NotificationResponse> getNotifications(Long memberId, Pageable pageable) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(memberId, pageable)
                .map(NotificationResponse::from);
    }

    /**
     * 읽지 않은 알림 수
     */
    public long getUnreadCount(Long memberId) {
        return notificationRepository.countByReceiverIdAndIsReadFalse(memberId);
    }

    /**
     * 단일 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId, Long memberId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("알림을 찾을 수 없습니다"));

        if (!notification.getReceiver().getId().equals(memberId)) {
            throw new ResourceNotFoundException("알림을 찾을 수 없습니다");
        }

        notification.markAsRead();
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllAsRead(Long memberId) {
        notificationRepository.markAllAsRead(memberId);
    }

    /**
     * 알림 삭제
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long memberId) {
        notificationRepository.deleteByIdAndReceiverId(notificationId, memberId);
    }
}
