package com.ezroad.service;

import com.ezroad.dto.request.ReviewCreateRequest;
import com.ezroad.dto.request.ReviewUpdateRequest;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Restaurant;
import com.ezroad.entity.Review;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.RestaurantRepository;
import com.ezroad.repository.ReviewRepository;
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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;

    // 리뷰 목록 조회 (페이지네이션)
    public Page<ReviewResponse> getReviewList(Pageable pageable) {
        return reviewRepository.findAllByDeletedAtIsNull(pageable)
                .map(ReviewResponse::from);
    }

    // 식당별 리뷰 목록 조회
    public Page<ReviewResponse> getReviewsByRestaurant(Long restaurantId, Pageable pageable) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("존재하지 않는 식당입니다");
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

    // 리뷰 상세 조회
    @Transactional
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다"));

        // 조회수 증가
        review.incrementHit();

        return ReviewResponse.from(review);
    }

    // 리뷰 작성
    @Transactional
    public ReviewResponse createReview(Long memberId, ReviewCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        Review review = Review.builder()
                .member(member)
                .restaurant(restaurant)
                .title(request.getTitle())
                .content(request.getContent())
                .rating(request.getRating())
                .build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (int i = 0; i < request.getImages().size(); i++) {
                String imageUrl = request.getImages().get(i);
                com.ezroad.entity.ReviewImage reviewImage = com.ezroad.entity.ReviewImage.builder()
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
    
    // 식당 리뷰 통계 업데이트 (private 헬퍼 메서드)
    private void updateRestaurantStats(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        // 실제 리뷰 개수 계산 (deleted_at이 null인 것만)
        Long reviewCount = reviewRepository.countByRestaurantIdAndDeletedAtIsNull(restaurantId);
        
        // 실제 평균 평점 계산
        Double avgRating = reviewRepository.findAverageRatingByRestaurantId(restaurantId)
                .orElse(0.0);
        
        // Restaurant 엔티티 업데이트
        restaurant.updateRating(
                java.math.BigDecimal.valueOf(avgRating),
                reviewCount.intValue()
        );
        
        restaurantRepository.save(restaurant);
        
        log.info("Restaurant #{} 통계 업데이트 완료 - 리뷰수: {}, 평균평점: {}", 
                restaurantId, reviewCount, avgRating);
    }
}
