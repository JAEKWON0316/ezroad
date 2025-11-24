package com.ezroad.dto.response;

import com.ezroad.entity.Waiting;
import com.ezroad.entity.WaitingStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WaitingResponse {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private Long restaurantId;
    private String restaurantName;
    private Integer waitingNumber;
    private Integer guestCount;
    private Integer estimatedWaitTime;
    private WaitingStatus status;
    private LocalDateTime createdAt;
    
    public static WaitingResponse from(Waiting waiting) {
        return WaitingResponse.builder()
                .id(waiting.getId())
                .memberId(waiting.getMember().getId())
                .memberNickname(waiting.getMember().getNickname())
                .restaurantId(waiting.getRestaurant().getId())
                .restaurantName(waiting.getRestaurant().getName())
                .waitingNumber(waiting.getWaitingNumber())
                .guestCount(waiting.getGuestCount())
                .estimatedWaitTime(waiting.getEstimatedWaitTime())
                .status(waiting.getStatus())
                .createdAt(waiting.getCreatedAt())
                .build();
    }
}
