package com.ezroad.service;

import com.ezroad.dto.request.ReservationCreateRequest;
import com.ezroad.dto.response.ReservationResponse;
import com.ezroad.entity.Member;
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

    // 예약 목록 조회 (회원별)
    public Page<ReservationResponse> getReservationsByMember(Long memberId, Pageable pageable) {
        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("존재하지 않는 회원입니다");
        }
        return reservationRepository.findByMemberIdOrderByReservationDateDescReservationTimeDesc(memberId, pageable)
                .map(ReservationResponse::from);
    }

    // 예약 목록 조회 (식당별)
    public Page<ReservationResponse> getReservationsByRestaurant(Long restaurantId, Pageable pageable) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("존재하지 않는 식당입니다");
        }
        return reservationRepository.findByRestaurantIdOrderByReservationDateDescReservationTimeDesc(restaurantId, pageable)
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
        return ReservationResponse.from(reservation);
    }
}
