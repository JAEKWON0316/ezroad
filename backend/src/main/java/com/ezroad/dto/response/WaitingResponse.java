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
    
    // 실시간 순번 정보
    private Integer positionInQueue;      // 내 앞에 몇 팀 (0이면 맨 앞)
    private Integer totalWaitingCount;    // 전체 대기 팀 수
    
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
                .positionInQueue(null)
                .totalWaitingCount(null)
                .build();
    }
    
    // 순번 정보 포함 버전
    public static WaitingResponse from(Waiting waiting, Integer position, Integer totalCount) {
        int estimatedTime = waiting.getEstimatedWaitTime() != null 
                ? waiting.getEstimatedWaitTime() 
                : (position != null ? (position + 1) * 15 : 0);
        
        return WaitingResponse.builder()
                .id(waiting.getId())
                .memberId(waiting.getMember().getId())
                .memberNickname(waiting.getMember().getNickname())
                .restaurantId(waiting.getRestaurant().getId())
                .restaurantName(waiting.getRestaurant().getName())
                .waitingNumber(waiting.getWaitingNumber())
                .guestCount(waiting.getGuestCount())
                .estimatedWaitTime(estimatedTime)
                .status(waiting.getStatus())
                .createdAt(waiting.getCreatedAt())
                .positionInQueue(position)
                .totalWaitingCount(totalCount)
                .build();
    }
}
