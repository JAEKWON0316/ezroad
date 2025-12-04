package com.ezroad.dto.response;

import com.ezroad.entity.Theme;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ThemeResponse {

    private Long id;
    private MemberSimpleResponse member;
    private String title;
    private String description;
    private String thumbnail;
    private Boolean isPublic;
    private Integer viewCount;
    private Integer restaurantCount;
    private LocalDateTime createdAt;

    public static ThemeResponse from(Theme theme) {
        return ThemeResponse.builder()
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
                .restaurantCount(theme.getRestaurantCount())
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
}
