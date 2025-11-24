package com.ezroad.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class ReservationCreateRequest {
    
    @NotNull(message = "식당 ID는 필수입니다")
    private Long restaurantId;
    
    @NotNull(message = "예약 날짜는 필수입니다")
    @Future(message = "예약 날짜는 현재보다 미래여야 합니다")
    private LocalDate reservationDate;
    
    @NotNull(message = "예약 시간은 필수입니다")
    private LocalTime reservationTime;
    
    @NotNull(message = "예약 인원은 필수입니다")
    @Min(value = 1, message = "예약 인원은 최소 1명입니다")
    @Max(value = 20, message = "예약 인원은 최대 20명입니다")
    private Integer partySize;
    
    @Size(max = 500, message = "요청사항은 500자 이내여야 합니다")
    private String specialRequests;
}
