package com.ezroad.service;

import com.ezroad.dto.request.ReservationCreateRequest;
import com.ezroad.dto.response.ReservationResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Notification;
import com.ezroad.entity.NotificationType;
import com.ezroad.entity.Reservation;
import com.ezroad.entity.ReservationStatus;
import com.ezroad.entity.Restaurant;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.ReservationRepository;
import com.ezroad.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;

    // 예약 목록 조회 (회원별) - 날짜 가까운 순
    public Page<ReservationResponse> getReservationsByMember(Long memberId, Pageable pageable) {
        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("존재하지 않는 회원입니다");
        }
        return reservationRepository.findByMemberIdOrderByReservationDateAscReservationTimeAsc(memberId, pageable)
                .map(ReservationResponse::from);
    }

    // 예약 목록 조회 (식당별) - 날짜 가까운 순
    public Page<ReservationResponse> getReservationsByRestaurant(Long restaurantId, Pageable pageable) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("존재하지 않는 식당입니다");
        }
        return reservationRepository.findByRestaurantIdOrderByReservationDateAscReservationTimeAsc(restaurantId, pageable)
                .map(ReservationResponse::from);
    }

    // 예약 상세 조회
    public ReservationResponse getReservationById(Long id, Long memberId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 예약입니다"));
        
        if (!reservation.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("예약 조회 권한이 없습니다");
        }
        
        return ReservationResponse.from(reservation);
    }

    // 예약 생성
    @Transactional
    public ReservationResponse createReservation(Long memberId, ReservationCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        Reservation reservation = Reservation.builder()
                .member(member)
                .restaurant(restaurant)
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .guestCount(request.getGuestCount())
                .request(request.getRequest())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        
        // 🔔 사업자에게 새 예약 알림 발송
        notificationService.sendNotification(
                restaurant.getOwner().getId(),  // 수신자: 사업자
                memberId,                        // 발신자: 고객
                NotificationType.RESERVATION_NEW,
                "새 예약이 들어왔습니다",
                String.format("%s님이 %s %s에 %d명 예약을 요청했습니다.",
                        member.getNickname(),
                        request.getReservationDate().toString(),
                        request.getReservationTime().toString(),
                        request.getGuestCount()),
                savedReservation.getId(),
                "RESERVATION",
                "/partner/restaurants/" + restaurant.getId() + "/reservations"
        );
        
        return ReservationResponse.from(savedReservation);
    }

    // 예약 확정 (사업자 전용)
    @Transactional
    public ReservationResponse confirmReservation(Long reservationId, Long ownerId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 예약입니다"));
        
        if (!reservation.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("예약 확정 권한이 없습니다");
        }

        reservation.updateStatus(ReservationStatus.CONFIRMED);
        
        // 🔔 고객에게 예약 확정 알림 발송
        notificationService.sendNotification(
                reservation.getMember().getId(),  // 수신자: 고객
                ownerId,                          // 발신자: 사업자
                NotificationType.RESERVATION_CONFIRMED,
                "예약이 확정되었습니다",
                String.format("%s 예약이 확정되었습니다. %s %s, %d명",
                        reservation.getRestaurant().getName(),
                        reservation.getReservationDate().toString(),
                        reservation.getReservationTime().toString(),
                        reservation.getGuestCount()),
                reservation.getId(),
                "RESERVATION",
                "/mypage/reservations"
        );
        
        return ReservationResponse.from(reservation);
    }

    // 예약 취소 (예약자 또는 식당 주인)
    @Transactional
    public void cancelReservation(Long reservationId, Long memberId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 예약입니다"));

        // 예약자 본인이거나 식당 주인인 경우 취소 가능
        boolean isReservationOwner = reservation.getMember().getId().equals(memberId);
        boolean isRestaurantOwner = reservation.getRestaurant().getOwner().getId().equals(memberId);
        
        if (!isReservationOwner && !isRestaurantOwner) {
            throw new UnauthorizedException("예약 취소 권한이 없습니다");
        }

        reservation.updateStatus(ReservationStatus.CANCELLED);
        
        // 🔔 상대방에게 예약 취소 알림 발송
        if (isRestaurantOwner) {
            // 사업자가 취소 → 고객에게 알림
            notificationService.sendNotification(
                    reservation.getMember().getId(),
                    memberId,
                    NotificationType.RESERVATION_CANCELLED,
                    "예약이 취소되었습니다",
                    String.format("%s 예약이 식당에 의해 취소되었습니다.",
                            reservation.getRestaurant().getName()),
                    reservation.getId(),
                    "RESERVATION",
                    "/mypage/reservations"
            );
        } else {
            // 고객이 취소 → 사업자에게 알림
            notificationService.sendNotification(
                    reservation.getRestaurant().getOwner().getId(),
                    memberId,
                    NotificationType.RESERVATION_CANCELLED,
                    "예약이 취소되었습니다",
                    String.format("%s님이 %s %s 예약을 취소했습니다.",
                            reservation.getMember().getNickname(),
                            reservation.getReservationDate().toString(),
                            reservation.getReservationTime().toString()),
                    reservation.getId(),
                    "RESERVATION",
                    "/partner/restaurants/" + reservation.getRestaurant().getId() + "/reservations"
            );
        }
        
        log.info("예약 #{} 취소됨 - 취소자: {}, 예약자: {}, 식당주인: {}", 
                reservationId, 
                isRestaurantOwner ? "식당주인" : "예약자",
                reservation.getMember().getId(),
                reservation.getRestaurant().getOwner().getId());
    }

    // 예약 완료 처리
    @Transactional
    public ReservationResponse completeReservation(Long reservationId, Long ownerId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 예약입니다"));
        
        if (!reservation.getRestaurant().getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("예약 완료 처리 권한이 없습니다");
        }

        reservation.updateStatus(ReservationStatus.COMPLETED);
        
        // 🔔 고객에게 방문 완료 + 리뷰 요청 알림 발송
        notificationService.sendNotification(
                reservation.getMember().getId(),  // 수신자: 고객
                ownerId,                          // 발신자: 사업자
                NotificationType.RESERVATION_COMPLETED,
                "방문이 완료되었습니다",
                String.format("%s 방문이 완료되었습니다. 리뷰를 작성해주세요!",
                        reservation.getRestaurant().getName()),
                reservation.getId(),
                "RESERVATION",
                "/mypage/reservations"
        );
        
        return ReservationResponse.from(reservation);
    }
}
