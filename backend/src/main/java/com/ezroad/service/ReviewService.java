package com.ezroad.service;

import com.ezroad.dto.request.ReviewCreateRequest;
import com.ezroad.dto.request.ReviewUpdateRequest;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.entity.*;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewViewRepository reviewViewRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    private final ReservationRepository reservationRepository;
    
    // 조회수 중복 방지 시간 (24시간)
    private static final int VIEW_DEDUP_HOURS = 24;

    // 리뷰 목록 조회 (페이지네이션) - 사진리뷰 필터 추가
    public Page<ReviewResponse> getReviewList(Pageable pageable, boolean photoOnly) {
        if (photoOnly) {
            return reviewRepository.findAllWithImagesByDeletedAtIsNull(pageable)
                    .map(ReviewResponse::from);
        }
        return reviewRepository.findAllByDeletedAtIsNull(pageable)
                .map(ReviewResponse::from);
    }
    
    // 사진리뷰 개수 조회
    public Long getPhotoReviewCount() {
        return reviewRepository.countWithImages();
    }
    
    // 전체 리뷰 개수 조회
    public Long getTotalReviewCount() {
        return reviewRepository.count();
    }

    // 식당별 리뷰 목록 조회 - 사진리뷰 필터 추가
    public Page<ReviewResponse> getReviewsByRestaurant(Long restaurantId, Pageable pageable, boolean photoOnly) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("존재하지 않는 식당입니다");
        }
        if (photoOnly) {
            return reviewRepository.findByRestaurantIdWithImagesByDeletedAtIsNull(restaurantId, pageable)
                    .map(ReviewResponse::from);
        }
        return reviewRepository.findByRestaurantIdAndDeletedAtIsNull(restaurantId, pageable)
                .map(ReviewResponse::from);
    }

    // 회원별 리뷰 목록 조회
    public Page<ReviewResponse> getReviewsByMember(Long memberId, Pageable pageable) {
        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("존재하지 않는 회원입니다");
        }
        return reviewRepository.findByMemberIdAndDeletedAtIsNull(memberId, pageable)
                .map(ReviewResponse::from);
    }

    // 리뷰 상세 조회 (조회수 중복 방지 포함)
    @Transactional
    public ReviewResponse getReviewById(Long id, String viewerIdentifier) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다"));

        // 24시간 내 동일 사용자 조회 여부 확인
        LocalDateTime since = LocalDateTime.now().minusHours(VIEW_DEDUP_HOURS);
        boolean hasRecentView = reviewViewRepository.existsRecentView(id, viewerIdentifier, since);
        
        if (!hasRecentView) {
            // 새로운 조회로 간주 - 조회수 증가 및 기록 저장
            review.incrementHit();
            
            ReviewView reviewView = ReviewView.builder()
                    .review(review)
                    .viewerIdentifier(viewerIdentifier)
                    .build();
            reviewViewRepository.save(reviewView);
            
            log.debug("리뷰 #{} 조회수 증가: {} (viewer: {})", id, review.getHit(), viewerIdentifier);
        } else {
            log.debug("리뷰 #{} 중복 조회 차단 (viewer: {})", id, viewerIdentifier);
        }

        return ReviewResponse.from(review);
    }
    
    // 기존 호환성을 위한 오버로드 (viewerIdentifier 없이 호출 시)
    @Transactional
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다"));
        // viewerIdentifier 없이 호출되면 항상 조회수 증가 (레거시 동작)
        review.incrementHit();
        return ReviewResponse.from(review);
    }

    // 리뷰 작성 (예약 기반)
    @Transactional
    public ReviewResponse createReview(Long memberId, ReviewCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        Restaurant restaurant;
        Reservation reservation = null;
        
        // 예약 기반 리뷰인 경우
        if (request.getReservationId() != null) {
            reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 예약입니다"));
            
            // 1. 본인의 예약인지 확인
            if (!reservation.getMember().getId().equals(memberId)) {
                throw new UnauthorizedException("본인의 예약에만 리뷰를 작성할 수 있습니다");
            }
            
            // 2. 예약 상태가 COMPLETED인지 확인
            if (reservation.getStatus() != ReservationStatus.COMPLETED) {
                throw new IllegalStateException("방문 완료된 예약에만 리뷰를 작성할 수 있습니다. 현재 상태: " + reservation.getStatus());
            }
            
            // 3. 이미 리뷰가 작성되었는지 확인
            if (reviewRepository.existsByReservationIdAndDeletedAtIsNull(request.getReservationId())) {
                throw new IllegalStateException("이미 해당 예약에 대한 리뷰가 작성되었습니다");
            }
            
            // 예약에서 식당 정보 가져오기
            restaurant = reservation.getRestaurant();
            log.info("예약 기반 리뷰 작성: 예약 #{}, 식당 #{}", reservation.getId(), restaurant.getId());
            
        } else if (request.getRestaurantId() != null) {
            // 예약 없이 직접 리뷰 작성 (기존 방식 - 향후 제한 가능)
            restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
            log.info("직접 리뷰 작성 (예약 없음): 회원 #{}, 식당 #{}", memberId, restaurant.getId());
            
        } else {
            throw new IllegalArgumentException("예약 ID 또는 식당 ID가 필요합니다");
        }

        Review review = Review.builder()
                .member(member)
                .restaurant(restaurant)
                .reservation(reservation)
                .title(request.getTitle())
                .content(request.getContent())
                .rating(request.getRating())
                .build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (int i = 0; i < request.getImages().size(); i++) {
                String imageUrl = request.getImages().get(i);
                ReviewImage reviewImage = ReviewImage.builder()
                        .review(review)
                        .imageUrl(imageUrl)
                        .sortOrder(i)
                        .build();
                review.addImage(reviewImage);
            }
        }

        Review savedReview = reviewRepository.save(review);
        
        // 식당 리뷰 통계 업데이트
        updateRestaurantStats(restaurant.getId());
        
        return ReviewResponse.from(savedReview);
    }

    // 리뷰 수정
    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long memberId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다"));

        if (!review.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("리뷰 수정 권한이 없습니다");
        }

        review.update(request.getTitle(), request.getContent(), request.getRating());
        
        // 평점이 변경되었을 수 있으므로 식당 통계 업데이트
        updateRestaurantStats(review.getRestaurant().getId());

        return ReviewResponse.from(review);
    }

    // 리뷰 삭제 (Soft Delete)
    @Transactional
    public void deleteReview(Long reviewId, Long memberId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다"));

        if (!review.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("리뷰 삭제 권한이 없습니다");
        }

        Long restaurantId = review.getRestaurant().getId();
        review.delete();
        
        // 식당 리뷰 통계 업데이트
        updateRestaurantStats(restaurantId);
    }

    // 식당 평균 평점 계산
    public Double getAverageRating(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("존재하지 않는 식당입니다");
        }
        return reviewRepository.findAverageRatingByRestaurantId(restaurantId)
                .orElse(0.0);
    }

    // 식당 리뷰 개수
    public Long getReviewCount(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("존재하지 않는 식당입니다");
        }
        return reviewRepository.countByRestaurantIdAndDeletedAtIsNull(restaurantId);
    }
    
    // 예약에 대한 리뷰 작성 가능 여부 확인
    public boolean canWriteReview(Long reservationId, Long memberId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) return false;
        
        // 본인의 예약인지, COMPLETED 상태인지, 이미 리뷰가 없는지 확인
        return reservation.getMember().getId().equals(memberId)
                && reservation.getStatus() == ReservationStatus.COMPLETED
                && !reviewRepository.existsByReservationIdAndDeletedAtIsNull(reservationId);
    }
    
    // 식당 리뷰 통계 업데이트 (private 헬퍼 메서드)
    private void updateRestaurantStats(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        Long reviewCount = reviewRepository.countByRestaurantIdAndDeletedAtIsNull(restaurantId);
        Double avgRating = reviewRepository.findAverageRatingByRestaurantId(restaurantId)
                .orElse(0.0);
        
        restaurant.updateRating(
                java.math.BigDecimal.valueOf(avgRating),
                reviewCount.intValue()
        );
        
        restaurantRepository.save(restaurant);
        
        log.info("Restaurant #{} 통계 업데이트 완료 - 리뷰수: {}, 평균평점: {}", 
                restaurantId, reviewCount, avgRating);
    }
}
