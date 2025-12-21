package com.ezroad.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 실시간 대기열 순번 업데이트 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitingQueueUpdateResponse {
    
    private Long waitingId;
    private Long restaurantId;
    private String restaurantName;
    private Integer waitingNumber;      // 내 대기번호
    private Integer positionInQueue;    // 내 앞에 몇 팀 (0이면 맨 앞)
    private Integer estimatedWaitTime;  // 예상 대기시간 (분)
    private Integer totalWaitingCount;  // 전체 대기 인원
    private String status;              // WAITING, CALLED
    private String timestamp;
}
