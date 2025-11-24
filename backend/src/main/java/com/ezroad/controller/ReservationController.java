package com.ezroad.controller;

import com.ezroad.dto.request.ReservationCreateRequest;
import com.ezroad.dto.response.ReservationResponse;
import com.ezroad.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // 내 예약 목록 조회
    @GetMapping("/my")
    public ResponseEntity<Page<ReservationResponse>> getMyReservations(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "reservationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reservationService.getReservationsByMember(memberId, pageable));
    }

    // 식당별 예약 목록 조회 (사업자 전용)
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<ReservationResponse>> getReservationsByRestaurant(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 20, sort = "reservationDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reservationService.getReservationsByRestaurant(restaurantId, pageable));
    }

    // 예약 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(reservationService.getReservationById(id, memberId));
    }

    // 예약 생성
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody ReservationCreateRequest request) {
        return ResponseEntity.ok(reservationService.createReservation(memberId, request));
    }

    // 예약 확정 (사업자 전용)
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ReservationResponse> confirmReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(reservationService.confirmReservation(id, memberId));
    }

    // 예약 취소
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        reservationService.cancelReservation(id, memberId);
        return ResponseEntity.noContent().build();
    }

    // 예약 완료 처리 (사업자 전용)
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ReservationResponse> completeReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(reservationService.completeReservation(id, memberId));
    }
}
