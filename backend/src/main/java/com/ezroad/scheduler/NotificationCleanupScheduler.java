package com.ezroad.scheduler;

import com.ezroad.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;

    /**
     * 매일 새벽 3시에 7일 이상 된 알림 삭제
     * cron: 초 분 시 일 월 요일
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteExpiredNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        int deletedCount = notificationRepository.deleteOldNotifications(cutoffDate);
        log.info("만료된 알림 {}개 삭제 완료 (7일 이전)", deletedCount);
    }
}
