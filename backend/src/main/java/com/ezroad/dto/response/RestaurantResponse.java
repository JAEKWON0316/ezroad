package com.ezroad.dto.response;

import com.ezroad.entity.Restaurant;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class RestaurantResponse {

    private Long id;
    private String name;
    private String category;
    private String description;
    private String phone;
    private String address;
    private String addressDetail;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String website;
    private String businessHours;
    private String notice;
    private String thumbnail;
    private String menuBoardImage;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Integer viewCount;
    private String status;
    private String ownerNickname;
    private LocalDateTime createdAt;

    public static RestaurantResponse from(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .category(restaurant.getCategory())
                .description(restaurant.getDescription())
                .phone(restaurant.getPhone())
                .address(restaurant.getAddress())
                .addressDetail(restaurant.getAddressDetail())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .website(restaurant.getWebsite())
                .businessHours(restaurant.getBusinessHours())
                .notice(restaurant.getNotice())
                .thumbnail(restaurant.getThumbnail())
                .menuBoardImage(restaurant.getMenuBoardImage())
                .avgRating(restaurant.getAvgRating())
                .reviewCount(restaurant.getReviewCount())
                .viewCount(restaurant.getViewCount())
                .status(restaurant.getStatus().name())
                .ownerNickname(restaurant.getOwner().getNickname())
                .createdAt(restaurant.getCreatedAt())
                .build();
    }
}
