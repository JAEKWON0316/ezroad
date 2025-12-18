package com.ezroad.controller;

import com.ezroad.dto.request.ReviewCreateRequest;
import com.ezroad.dto.request.ReviewUpdateRequest;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 목록 조회 (photoOnly 파라미터 추가)
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @RequestParam(defaultValue = "false") boolean photoOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewList(pageable, photoOnly));
    }
    
    // 리뷰 개수 조회 (전체/사진리뷰)
    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getReviewCounts() {
        Long totalCount = reviewService.getTotalReviewCount();
        Long photoCount = reviewService.getPhotoReviewCount();
        return ResponseEntity.ok(Map.of(
            "total", totalCount,
            "photo", photoCount
        ));
    }

    // 식당별 리뷰 조회 (photoOnly 파라미터 추가)
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "false") boolean photoOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByRestaurant(restaurantId, pageable, photoOnly));
    }

    // 내 리뷰 조회
    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByMember(memberId, pageable));
    }

    // 리뷰 상세 조회 (조회수 24시간 중복 방지)
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId,
            HttpServletRequest request) {
        
        // 조회자 식별자 생성 (로그인 사용자: member:{id}, 비로그인: ip:{hash})
        String viewerIdentifier = createViewerIdentifier(memberId, request);
        
        return ResponseEntity.ok(reviewService.getReviewById(id, viewerIdentifier));
    }

    // 리뷰 작성
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(reviewService.createReview(memberId, request));
    }

    // 리뷰 수정
    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody ReviewUpdateRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, memberId, request));
    }

    // 리뷰 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        reviewService.deleteReview(id, memberId);
        return ResponseEntity.noContent().build();
    }

    // 식당 평균 평점 조회
    @GetMapping("/restaurant/{restaurantId}/rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getAverageRating(restaurantId));
    }

    // 식당 리뷰 개수 조회
    @GetMapping("/restaurant/{restaurantId}/count")
    public ResponseEntity<Long> getReviewCount(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getReviewCount(restaurantId));
    }
    
    // 예약에 대한 리뷰 작성 가능 여부 확인
    @GetMapping("/can-write/{reservationId}")
    public ResponseEntity<Map<String, Boolean>> canWriteReview(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal Long memberId) {
        boolean canWrite = reviewService.canWriteReview(reservationId, memberId);
        return ResponseEntity.ok(Map.of("canWrite", canWrite));
    }
    
    // ==================== Private Helper Methods ====================
    
    /**
     * 조회자 식별자 생성
     * - 로그인 사용자: "member:{memberId}"
     * - 비로그인 사용자: "ip:{IP+UserAgent 해시}"
     */
    private String createViewerIdentifier(Long memberId, HttpServletRequest request) {
        if (memberId != null) {
            return "member:" + memberId;
        }
        
        // 비로그인 사용자: IP + User-Agent 해시
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String raw = ip + ":" + (userAgent != null ? userAgent : "unknown");
        
        return "ip:" + hashString(raw);
    }
    
    /**
     * 클라이언트 실제 IP 추출 (프록시/로드밸런서 고려)
     */
    private String getClientIp(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can contain multiple IPs, get the first one
                return ip.split(",")[0].trim();
            }
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * 문자열 SHA-256 해시
     */
    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 32); // 32자로 제한
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 해시 생성 실패", e);
            return String.valueOf(input.hashCode()); // 폴백
        }
    }
}
