package com.ezroad.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewCreateRequest {

    // 예약 기반 리뷰 작성 시 필수 (예약 ID로 식당 정보 추출)
    private Long reservationId;
    
    // 예약 없이 직접 리뷰 작성 시 사용 (reservationId가 없을 때만 필수)
    private Long restaurantId;

    @Size(max = 100, message = "제목은 100자 이내여야 합니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    @Size(max = 2000, message = "내용은 2000자 이내여야 합니다")
    private String content;

    @NotNull(message = "별점은 필수입니다")
    @Min(value = 1, message = "별점은 1 이상이어야 합니다")
    @Max(value = 5, message = "별점은 5 이하여야 합니다")
    private Integer rating;

    private java.util.List<String> images;
}
