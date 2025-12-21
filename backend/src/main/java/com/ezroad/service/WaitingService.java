package com.ezroad.service;

import com.ezroad.dto.request.WaitingCreateRequest;
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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaitingService {

    private final WaitingRepository waitingRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;
    
    // 한국 시간대
    private static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");

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
        
        // 예상 대기 시간 (대기중인 팀 수 기준, 팀당 평균 15분)
        Integer estimatedWaitTime = (activeCount + 1) * 15;

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
        
        // 🔔 사업자에게 새 대기 알림 발송
        notificationService.sendNotification(
                restaurant.getOwner().getId(),  // 수신자: 사업자
                memberId,                        // 발신자: 고객
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
        
        // 🔔 대기 인원 변경 브로드캐스트 (해당 식당 구독자에게)
        broadcastWaitingCountUpdate(restaurant.getId());
        
        return WaitingResponse.from(savedWaiting);
    }

    // 내 대기 목록
    public Page<WaitingResponse> getMyWaitings(Long memberId, Pageable pageable) {
        Page<Waiting> waitings = waitingRepository.findByMemberId(memberId, pageable);
        return waitings.map(WaitingResponse::from);
    }

    // 식당별 대기 목록 (사업자용)
    public Page<WaitingResponse> getWaitingsByRestaurant(Long restaurantId, Pageable pageable) {
        Page<Waiting> waitings = waitingRepository.findByRestaurantId(restaurantId, pageable);
        return waitings.map(WaitingResponse::from);
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
        
        return WaitingResponse.from(waiting);
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
        
        // 🔔 고객에게 호출 알림 발송
        notificationService.sendNotification(
                waiting.getMember().getId(),  // 수신자: 고객
                ownerId,                       // 발신자: 사업자
                NotificationType.WAITING_CALLED,
                "입장해주세요!",
                String.format("%s에서 입장을 요청합니다. 지금 바로 매장으로 와주세요!",
                        waiting.getRestaurant().getName()),
                waiting.getId(),
                "WAITING",
                "/mypage/waitings"
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
        
        // 🔔 대기 인원 변경 브로드캐스트
        broadcastWaitingCountUpdate(waiting.getRestaurant().getId());
        
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
        
        waiting.cancel();
        
        // 🔔 대기 인원 변경 브로드캐스트
        broadcastWaitingCountUpdate(waiting.getRestaurant().getId());
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
        
        waiting.noShow();
        
        // 🔔 대기 인원 변경 브로드캐스트
        broadcastWaitingCountUpdate(waiting.getRestaurant().getId());
        
        return WaitingResponse.from(waiting);
    }
    
    /**
     * 대기 인원 변경 시 해당 식당 구독자에게 브로드캐스트
     */
    private void broadcastWaitingCountUpdate(Long restaurantId) {
        // 한국 시간 기준 오늘 00:00:00
        LocalDateTime startOfToday = LocalDate.now(KOREA_ZONE).atStartOfDay();
        
        // 현재 대기 중인 인원 수
        Integer count = waitingRepository.countTodayWaitingsByRestaurantAndStatus(
                restaurantId, WaitingStatus.WAITING, startOfToday);
        int waitingCount = count != null ? count : 0;
        
        // 토픽으로 브로드캐스트
        notificationService.broadcastToTopic(
                "restaurant/" + restaurantId + "/waiting-count",
                java.util.Map.of(
                        "restaurantId", restaurantId,
                        "waitingCount", waitingCount,
                        "timestamp", LocalDateTime.now(KOREA_ZONE).toString()
                )
        );
        
        log.info("대기 인원 브로드캐스트 - 식당: {}, 대기수: {}", restaurantId, waitingCount);
    }
}
