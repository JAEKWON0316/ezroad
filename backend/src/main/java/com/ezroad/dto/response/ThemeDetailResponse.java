package com.ezroad.dto.response;

import com.ezroad.entity.Theme;
import com.ezroad.entity.ThemeRestaurant;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ThemeDetailResponse {

    private Long id;
    private MemberSimpleResponse member;
    private String title;
    private String description;
    private String thumbnail;
    private Boolean isPublic;
    private Integer viewCount;
    private Integer restaurantCount;
    private List<ThemeRestaurantResponse> restaurants;
    private LocalDateTime createdAt;

    public static ThemeDetailResponse from(Theme theme) {
        List<ThemeRestaurantResponse> restaurants = theme.getThemeRestaurants().stream()
                .map(ThemeRestaurantResponse::from)
                .toList();

        return ThemeDetailResponse.builder()
                .id(theme.getId())
                .member(MemberSimpleResponse.builder()
                        .id(theme.getMember().getId())
                        .nickname(theme.getMember().getNickname())
                        .profileImage(theme.getMember().getProfileImage())
                        .build())
                .title(theme.getTitle())
                .description(theme.getDescription())
                .thumbnail(theme.getThumbnail())
                .isPublic(theme.getIsPublic())
                .viewCount(theme.getViewCount())
                .restaurantCount(restaurants.size())
                .restaurants(restaurants)
                .createdAt(theme.getCreatedAt())
                .build();
    }

    @Getter
    @Builder
    public static class MemberSimpleResponse {
        private Long id;
        private String nickname;
        private String profileImage;
    }

    @Getter
    @Builder
    public static class ThemeRestaurantResponse {
        private Long id;
        private Long restaurantId;
        private String name;
        private String category;
        private String address;
        private String thumbnail;
        private BigDecimal avgRating;
        private Integer reviewCount;
        private Integer sortOrder;
        private String memo;
        private BigDecimal latitude;
        private BigDecimal longitude;

        public static ThemeRestaurantResponse from(ThemeRestaurant tr) {
            return ThemeRestaurantResponse.builder()
                    .id(tr.getId())
                    .restaurantId(tr.getRestaurant().getId())
                    .name(tr.getRestaurant().getName())
                    .category(tr.getRestaurant().getCategory())
                    .address(tr.getRestaurant().getAddress())
                    .thumbnail(tr.getRestaurant().getThumbnail())
                    .avgRating(tr.getRestaurant().getAvgRating())
                    .reviewCount(tr.getRestaurant().getReviewCount())
                    .sortOrder(tr.getSortOrder())
                    .memo(tr.getMemo())
                    .latitude(tr.getRestaurant().getLatitude())
                    .longitude(tr.getRestaurant().getLongitude())
                    .build();
        }
    }
}
