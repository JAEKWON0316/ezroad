package com.ezroad.service;

import com.ezroad.dto.request.WaitingCreateRequest;
import com.ezroad.dto.response.WaitingQueueUpdateResponse;
import com.ezroad.dto.response.WaitingResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.NotificationType;
import com.ezroad.entity.Restaurant;
import com.ezroad.entity.Waiting;
import com.ezroad.entity.WaitingStatus;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.RestaurantRepository;
import com.ezroad.repository.WaitingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaitingService {

    private final WaitingRepository waitingRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;
    private final WaitingRedisService waitingRedisService;
    
    // 한국 시간대
    private static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");
    // 팀당 평균 대기시간 (분)
    private static final int MINUTES_PER_TEAM = 15;

    // 대기 등록
    @Transactional
    public WaitingResponse createWaiting(Long memberId, WaitingCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        // 한국 시간 기준 오늘 00:00:00
        LocalDateTime startOfToday = LocalDate.now(KOREA_ZONE).atStartOfDay();
        
        // 오늘 해당 식당의 전체 대기 수 조회 (대기번호 부여용)
        Integer todayTotalCount = waitingRepository.countTodayWaitingsByRestaurant(
                request.getRestaurantId(), startOfToday);
        int totalCount = todayTotalCount != null ? todayTotalCount : 0;
        
        // 대기번호 생성 (오늘 기준 순번)
        Integer waitingNumber = totalCount + 1;
        
        // 현재 WAITING 상태인 대기 수 조회 (예상 대기 시간 계산용)
        Integer currentWaitingCount = waitingRepository.countTodayWaitingsByRestaurantAndStatus(
                request.getRestaurantId(), WaitingStatus.WAITING, startOfToday);
        int activeCount = currentWaitingCount != null ? currentWaitingCount : 0;
        
        // 예상 대기 시간 (대기중인 팀 수 기준)
        Integer estimatedWaitTime = (activeCount + 1) * MINUTES_PER_TEAM;

        Waiting waiting = Waiting.builder()
                .member(member)
                .restaurant(restaurant)
                .waitingNumber(waitingNumber)
                .guestCount(request.getGuestCount())
                .estimatedWaitTime(estimatedWaitTime)
                .status(WaitingStatus.WAITING)
                .build();

        Waiting savedWaiting = waitingRepository.save(waiting);
        log.info("대기 등록 완료 - 식당: {}, 대기번호: {}, 예상시간: {}분", 
                restaurant.getName(), waitingNumber, estimatedWaitTime);
        
        // 🔴 Redis에 대기 추가
        waitingRedisService.addToQueue(
                restaurant.getId(), 
                savedWaiting.getId(), 
                waitingNumber, 
                memberId
        );
        
        // 🔔 사업자에게 새 대기 알림 발송
        notificationService.sendNotification(
                restaurant.getOwner().getId(),
                memberId,
                NotificationType.WAITING_NEW,
                "새 대기가 등록되었습니다",
                String.format("%s님이 %d명으로 대기 등록했습니다. (대기번호: %d)",
                        member.getNickname(),
                        request.getGuestCount(),
                        waitingNumber),
                savedWaiting.getId(),
                "WAITING",
                "/partner/restaurants/" + restaurant.getId() + "/waitings"
        );
        
        // 🔔 대기 인원 변경 브로드캐스트 + 기존 대기자들에게 순번 업데이트
        broadcastWaitingUpdate(restaurant.getId(), restaurant.getName());
        
        // 새로 등록한 대기의 순번 정보 포함해서 반환
        return WaitingResponse.from(savedWaiting, activeCount, activeCount + 1);
    }

    // 내 대기 목록 (순번 정보 포함)
    public Page<WaitingResponse> getMyWaitings(Long memberId, Pageable pageable) {
        Page<Waiting> waitings = waitingRepository.findByMemberId(memberId, pageable);
        LocalDateTime startOfToday = LocalDate.now(KOREA_ZONE).atStartOfDay();
        
        return waitings.map(waiting -> {
            // WAITING 상태인 경우에만 순번 계산
            if (waiting.getStatus() == WaitingStatus.WAITING) {
                int position = calculatePosition(waiting, startOfToday);
                int totalCount = getActiveWaitingCount(waiting.getRestaurant().getId(), startOfToday);
                return WaitingResponse.from(waiting, position, totalCount);
            }
            return WaitingResponse.from(waiting);
        });
    }

    // 식당별 대기 목록 (사업자용, 순번 정보 포함)
    public Page<WaitingResponse> getWaitingsByRestaurant(Long restaurantId, Pageable pageable) {
        Page<Waiting> waitings = waitingRepository.findByRestaurantId(restaurantId, pageable);
        LocalDateTime startOfToday = LocalDate.now(KOREA_ZONE).atStartOfDay();
        int totalCount = getActiveWaitingCount(restaurantId, startOfToday);
        
        return waitings.map(waiting -> {
            // WAITING 상태인 경우에만 순번 계산
            if (waiting.getStatus() == WaitingStatus.WAITING) {
                int position = calculatePosition(waiting, startOfToday);
                return WaitingResponse.from(waiting, position, totalCount);
            }
            return WaitingResponse.from(waiting);
        });
    }
    
    // 순번 계산 (내 앞에 몇 팀)
    private int calculatePosition(Waiting waiting, LocalDateTime startOfToday) {
        Integer count = waitingRepository.countWaitingsBeforeMe(
                waiting.getRestaurant().getId(),
                waiting.getWaitingNumber(),
                WaitingStatus.WAITING,
                startOfToday
        );
        return count != null ? count : 0;
    }
    
    // 현재 대기중인 팀 수
    private int getActiveWaitingCount(Long restaurantId, LocalDateTime startOfToday) {
        Integer count = waitingRepository.countTodayWaitingsByRestaurantAndStatus(
                restaurantId, WaitingStatus.WAITING, startOfToday);
        return count != null ? count : 0;
    }

    // 대기 상세 조회
    public WaitingResponse getWaitingById(Long id, Long memberId) {
        Waiting waiting = waitingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 대기입니다"));
        
        // 본인 또는 사업자만 조회 가능
        if (!waiting.getMember().getId().equals(memberId) &&
            !waiting.getRestaurant().getOwner().getId().equals(memberId)) {
            throw new UnauthorizedException("조회 권한이 없습니다");
        }
        
        // WAITING 상태면 순번 정보 포함
        if (waiting.getStatus() == WaitingStatus.WAITING) {
            LocalDateTime startOfToday = LocalDate.now(KOREA_ZONE).atStartOfDay();
            int position = calculatePosition(waiting, startOfToday);
            int totalCount = getActiveWaitingCount(waiting.getRestaurant().getId(), startOfToday);
            return WaitingResponse.from(waiting, position, totalCount);
        }
        
        return WaitingResponse.from(waiting);
    }
    
    // 내 대기 순번 정보 조회 (Redis 기반)
    public WaitingQueueUpdateResponse getMyQueuePosition(Long memberId) {
        Map<Object, Object> info = waitingRedisService.getMemberWaitingInfo(memberId);
        
        if (info.isEmpty()) {
            return null; // 현재 대기 없음
        }
        
        Long restaurantId = Long.parseLong(info.get("restaurantId").toString());
        Long waitingId = Long.parseLong(info.get("waitingId").toString());
        Integer waitingNumber = Integer.parseInt(info.get("waitingNumber").toString());
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElse(null);
        
        int position = waitingRedisService.getPositionInQueue(restaurantId, waitingId);
        int totalCount = waitingRedisService.getWaitingCount(restaurantId);
        int estimatedTime = (position + 1) * MINUTES_PER_TEAM;
        
        return WaitingQueueUpdateResponse.builder()
                .waitingId(waitingId)
                .restaurantId(restaurantId)
                .restaurantName(restaurant != null ? restaurant.getName() : "")
                .waitingNumber(waitingNumber)
                .positionInQueue(position)
                .estimatedWaitTime(estimatedTime)
                .totalWaitingCount(totalCount)
                .status("WAITING")
                .timestamp(LocalDateTime.now(KOREA_ZONE).toString())
                .build();
    }

    // 대기 호출 (사업자용)
    @Transactional
    public WaitingResponse callWaiting(Long id, Long ownerId) {
        Waiting waiting = waitingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 대기입니다"));
        
        // 사업자 권한 확인
        if (!waiting.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("권한이 없습니다");
        }
        
        waiting.call();
        
        // 🔴 Redis에서 대기 제거 (호출됨 = 대기열에서 나감)
        waitingRedisService.removeFromQueue(
                waiting.getRestaurant().getId(),
                waiting.getId(),
                waiting.getMember().getId()
        );
        
        // 🔔 고객에게 호출 알림 발송
        notificationService.sendNotification(
                waiting.getMember().getId(),
                ownerId,
                NotificationType.WAITING_CALLED,
                "입장해주세요!",
                String.format("%s에서 입장을 요청합니다. 지금 바로 매장으로 와주세요!",
                        waiting.getRestaurant().getName()),
                waiting.getId(),
                "WAITING",
                "/mypage/waitings"
        );
        
        // 🔔 대기 인원 변경 브로드캐스트 + 순번 업데이트
        broadcastWaitingUpdate(
                waiting.getRestaurant().getId(), 
                waiting.getRestaurant().getName()
        );
        
        return WaitingResponse.from(waiting);
    }

    // 대기 착석 처리 (사업자용)
    @Transactional
    public WaitingResponse seatWaiting(Long id, Long ownerId) {
        Waiting waiting = waitingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 대기입니다"));
        
        // 사업자 권한 확인
        if (!waiting.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("권한이 없습니다");
        }
        
        waiting.seat();
        
        // Redis에서 이미 제거됨 (call 시점에)
        
        return WaitingResponse.from(waiting);
    }

    // 대기 취소
    @Transactional
    public void cancelWaiting(Long id, Long memberId) {
        Waiting waiting = waitingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 대기입니다"));
        
        // 본인만 취소 가능
        if (!waiting.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("취소 권한이 없습니다");
        }
        
        Long restaurantId = waiting.getRestaurant().getId();
        String restaurantName = waiting.getRestaurant().getName();
        
        waiting.cancel();
        
        // 🔴 Redis에서 대기 제거
        waitingRedisService.removeFromQueue(restaurantId, waiting.getId(), memberId);
        
        // 🔔 대기 인원 변경 브로드캐스트 + 순번 업데이트
        broadcastWaitingUpdate(restaurantId, restaurantName);
    }

    // No-Show 처리 (사업자용)
    @Transactional
    public WaitingResponse noShowWaiting(Long id, Long ownerId) {
        Waiting waiting = waitingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 대기입니다"));
        
        // 사업자 권한 확인
        if (!waiting.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("권한이 없습니다");
        }
        
        Long restaurantId = waiting.getRestaurant().getId();
        String restaurantName = waiting.getRestaurant().getName();
        
        waiting.noShow();
        
        // Redis에서 이미 제거됨 (call 시점에)
        
        // 🔔 대기 인원 브로드캐스트
        broadcastWaitingUpdate(restaurantId, restaurantName);
        
        return WaitingResponse.from(waiting);
    }
    
    /**
     * 대기 인원 변경 시 브로드캐스트
     * 1. 토픽으로 전체 대기 수 브로드캐스트 (식당 상세 페이지용)
     * 2. 해당 식당의 모든 WAITING 고객에게 개인 순번 업데이트
     */
    private void broadcastWaitingUpdate(Long restaurantId, String restaurantName) {
        // 한국 시간 기준 오늘 00:00:00
        LocalDateTime startOfToday = LocalDate.now(KOREA_ZONE).atStartOfDay();
        
        // DB에서 현재 대기 중인 목록 조회
        List<Waiting> activeWaitings = waitingRepository.findActiveWaitingsByRestaurant(
                restaurantId, WaitingStatus.WAITING, startOfToday);
        
        int waitingCount = activeWaitings.size();
        
        // Redis 동기화
        waitingRedisService.setWaitingCount(restaurantId, waitingCount);
        
        // 1. 토픽으로 대기 수 브로드캐스트 (식당 상세, 파트너 대시보드용)
        notificationService.broadcastToTopic(
                "restaurant/" + restaurantId + "/waiting-count",
                Map.of(
                        "restaurantId", restaurantId,
                        "waitingCount", waitingCount,
                        "timestamp", LocalDateTime.now(KOREA_ZONE).toString()
                )
        );
        
        // 2. 각 대기자에게 개인 순번 업데이트 전송
        for (int i = 0; i < activeWaitings.size(); i++) {
            Waiting waiting = activeWaitings.get(i);
            int position = i; // 0 = 맨 앞
            int estimatedTime = (position + 1) * MINUTES_PER_TEAM;
            
            WaitingQueueUpdateResponse update = WaitingQueueUpdateResponse.builder()
                    .waitingId(waiting.getId())
                    .restaurantId(restaurantId)
                    .restaurantName(restaurantName)
                    .waitingNumber(waiting.getWaitingNumber())
                    .positionInQueue(position)
                    .estimatedWaitTime(estimatedTime)
                    .totalWaitingCount(waitingCount)
                    .status(waiting.getStatus().name())
                    .timestamp(LocalDateTime.now(KOREA_ZONE).toString())
                    .build();
            
            // 개인에게 순번 업데이트 전송
            notificationService.sendVolatileNotification(
                    waiting.getMember().getId(),
                    NotificationType.WAITING_QUEUE_UPDATE,
                    update
            );
        }
        
        log.info("대기열 브로드캐스트 - 식당: {}, 대기수: {}, 개인알림: {}명", 
                restaurantId, waitingCount, activeWaitings.size());
    }
}
