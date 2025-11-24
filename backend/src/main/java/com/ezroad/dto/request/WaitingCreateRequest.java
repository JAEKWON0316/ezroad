package com.ezroad.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WaitingCreateRequest {
    
    @NotNull(message = "식당 ID는 필수입니다")
    private Long restaurantId;
    
    @NotNull(message = "대기 인원은 필수입니다")
    private Integer guestCount;
}
