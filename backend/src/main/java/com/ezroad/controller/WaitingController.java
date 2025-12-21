package com.ezroad.controller;

import com.ezroad.dto.request.WaitingCreateRequest;
import com.ezroad.dto.response.WaitingQueueUpdateResponse;
import com.ezroad.dto.response.WaitingResponse;
import com.ezroad.service.WaitingService;
import com.ezroad.service.WaitingRedisService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/waitings")
@RequiredArgsConstructor
public class WaitingController {

    private final WaitingService waitingService;
    private final WaitingRedisService waitingRedisService;

    // 대기 등록
    @PostMapping
    public ResponseEntity<WaitingResponse> createWaiting(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody WaitingCreateRequest request) {
        return ResponseEntity.ok(waitingService.createWaiting(memberId, request));
    }

    // 내 대기 목록
    @GetMapping("/my")
    public ResponseEntity<Page<WaitingResponse>> getMyWaitings(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(waitingService.getMyWaitings(memberId, pageable));
    }

    // 식당별 대기 목록 (사업자용)
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<WaitingResponse>> getRestaurantWaitings(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 20, sort = "waitingNumber", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(waitingService.getWaitingsByRestaurant(restaurantId, pageable));
    }

    // 대기 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<WaitingResponse> getWaiting(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(waitingService.getWaitingById(id, memberId));
    }

    // 대기 호출 (사업자용)
    @PatchMapping("/{id}/call")
    public ResponseEntity<WaitingResponse> callWaiting(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(waitingService.callWaiting(id, memberId));
    }

    // 대기 착석 처리 (사업자용)
    @PatchMapping("/{id}/seat")
    public ResponseEntity<WaitingResponse> seatWaiting(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(waitingService.seatWaiting(id, memberId));
    }

    // 대기 취소
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelWaiting(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        waitingService.cancelWaiting(id, memberId);
        return ResponseEntity.noContent().build();
    }

    // No-Show 처리 (사업자용)
    @PatchMapping("/{id}/no-show")
    public ResponseEntity<WaitingResponse> noShowWaiting(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(waitingService.noShowWaiting(id, memberId));
    }

    // 내 대기 순번 조회 (Redis 기반 실시간)
    @GetMapping("/my/position")
    public ResponseEntity<WaitingQueueUpdateResponse> getMyQueuePosition(
            @AuthenticationPrincipal Long memberId) {
        WaitingQueueUpdateResponse response = waitingService.getMyQueuePosition(memberId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    // 식당 대기 인원 수 조회 (Redis 기반 실시간)
    @GetMapping("/restaurant/{restaurantId}/count")
    public ResponseEntity<Map<String, Object>> getWaitingCount(
            @PathVariable Long restaurantId) {
        int count = waitingRedisService.getWaitingCount(restaurantId);
        return ResponseEntity.ok(Map.of(
                "restaurantId", restaurantId,
                "waitingCount", count
        ));
    }
}
