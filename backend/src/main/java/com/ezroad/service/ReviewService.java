package com.ezroad.service;

import com.ezroad.dto.request.ReviewCreateRequest;
import com.ezroad.dto.request.ReviewUpdateRequest;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.entity.*;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.ReservationRepository;
import com.ezroad.repository.RestaurantRepository;
import com.ezroad.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String REVIEW_VIEW_PREFIX = "review:view:";
    private static final Duration VIEW_EXPIRY = Duration.ofHours(24);

    // 리뷰 목록 조회 (페이지네이션, photoOnly 필터)
    public Page<ReviewResponse> getReviewList(Pageable pageable, boolean photoOnly) {
        if (photoOnly) {
            return reviewRepository.findAllWithImagesByDeletedAtIsNull(pageable)
                    .map(ReviewResponse::from);
        }
        return reviewRepository.findAllByDeletedAtIsNull(pageable)
                .map(ReviewResponse::from);
    }
    
    // 전체 리뷰 개수
    public Long getTotalReviewCount() {
        return reviewRepository.countByDeletedAtIsNull();
    }
    
    // 사진 리뷰 개수
    public Long getPhotoReviewCount() {
        return reviewRepository.countWithImages();
    }

    // 식당별 리뷰 목록 조회 (photoOnly 필터)
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

    // 리뷰 상세 조회 (24시간 조회수 중복 방지)
    @Transactional
    public ReviewResponse getReviewById(Long id, String viewerIdentifier) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리뷰입니다"));

        // Redis로 24시간 내 중복 조회 체크
        String redisKey = REVIEW_VIEW_PREFIX + id + ":" + viewerIdentifier;
        Boolean alreadyViewed = redisTemplate.hasKey(redisKey);
        
        if (alreadyViewed == null || !alreadyViewed) {
            review.incrementHit();
            redisTemplate.opsForValue().set(redisKey, "1", VIEW_EXPIRY);
            log.debug("리뷰 조회수 증가 - reviewId: {}, viewer: {}", id, viewerIdentifier);
        }

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
                ReviewImage reviewImage = ReviewImage.builder()
                        .review(review)
                        .imageUrl(imageUrl)
                        .sortOrder(i)
                        .build();
                review.addImage(reviewImage);
            }
        }

        Review savedReview = reviewRepository.save(review);
        
        // 🔔 사업자에게 새 리뷰 알림 발송
        notificationService.sendNotification(
                restaurant.getOwner().getId(),
                memberId,
                NotificationType.NEW_REVIEW,
                "새 리뷰가 등록되었습니다",
                String.format("%s님이 ⭐%d점 리뷰를 작성했습니다: %s",
                        member.getNickname(),
                        request.getRating(),
                        request.getTitle() != null ? request.getTitle() : 
                            request.getContent().substring(0, Math.min(30, request.getContent().length()))),
                savedReview.getId(),
                "REVIEW",
                "/partner/reviews"
        );
        
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

        review.delete();
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
        // 예약 존재 확인
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) {
            return false;
        }
        
        // 본인 예약인지 확인
        if (!reservation.getMember().getId().equals(memberId)) {
            return false;
        }
        
        // 예약 완료 상태인지 확인
        if (reservation.getStatus() != ReservationStatus.COMPLETED) {
            return false;
        }
        
        // 이미 리뷰 작성했는지 확인 (예약 ID로 리뷰 검색)
        // 참고: reservationId로 리뷰 연결이 필요한 경우 Review 엔티티에 reservation 필드 추가 필요
        // 현재는 같은 식당 + 같은 회원 + 예약 완료 후 리뷰가 없으면 작성 가능으로 처리
        
        return true;
    }
}
