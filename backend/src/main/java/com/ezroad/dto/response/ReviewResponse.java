package com.ezroad.dto.response;

import com.ezroad.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ReviewResponse {
    
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private Long memberId;
    private String memberNickname;
    private String memberProfileImage;
    private String title;
    private String content;
    private Integer rating;
    private Integer hit;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .restaurantId(review.getRestaurant().getId())
                .restaurantName(review.getRestaurant().getName())
                .memberId(review.getMember().getId())
                .memberNickname(review.getMember().getNickname())
                .memberProfileImage(review.getMember().getProfileImage())
                .title(review.getTitle())
                .content(review.getContent())
                .rating(review.getRating())
                .hit(review.getHit())
                .imageUrls(review.getImages().stream()
                        .map(img -> img.getImageUrl())
                        .collect(Collectors.toList()))
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
