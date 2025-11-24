package com.ezroad.dto.response;

import com.ezroad.entity.Follow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class FollowResponse {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantThumbnail;
    private LocalDateTime createdAt;

    public static FollowResponse from(Follow follow) {
        return FollowResponse.builder()
                .id(follow.getId())
                .memberId(follow.getFollower().getId())
                .memberNickname(follow.getFollower().getNickname())
                .restaurantId(follow.getRestaurant().getId())
                .restaurantName(follow.getRestaurant().getName())
                .restaurantThumbnail(follow.getRestaurant().getThumbnail())
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
