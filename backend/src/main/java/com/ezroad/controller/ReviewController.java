package com.ezroad.controller;

import com.ezroad.dto.request.ReviewCreateRequest;
import com.ezroad.dto.request.ReviewUpdateRequest;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.service.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 목록 조회
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewList(pageable));
    }

    // 식당별 리뷰 조회
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByRestaurant(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByRestaurant(restaurantId, pageable));
    }

    // 내 리뷰 조회
    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByMember(memberId, pageable));
    }

    // 리뷰 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
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
}
