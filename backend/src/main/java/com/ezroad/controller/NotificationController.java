package com.ezroad.controller;

import com.ezroad.dto.response.NotificationResponse;
import com.ezroad.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 내 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.getNotifications(memberId, pageable));
    }

    /**
     * 읽지 않은 알림 수
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal Long memberId
    ) {
        long count = notificationService.getUnreadCount(memberId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 단일 알림 읽음 처리
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId
    ) {
        notificationService.markAsRead(id, memberId);
        return ResponseEntity.ok().build();
    }

    /**
     * 모든 알림 읽음 처리
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal Long memberId
    ) {
        notificationService.markAllAsRead(memberId);
        return ResponseEntity.ok().build();
    }

    /**
     * 알림 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId
    ) {
        notificationService.deleteNotification(id, memberId);
        return ResponseEntity.ok().build();
    }
}
