package com.ezroad.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MappingCreateRequest {

    @NotBlank(message = "식당 이름은 필수입니다")
    private String restaurantName;

    @NotNull(message = "위도는 필수입니다")
    private BigDecimal latitude;

    @NotNull(message = "경도는 필수입니다")
    private BigDecimal longitude;

    @NotBlank(message = "주소는 필수입니다")
    private String address;

    private String addressDetail;
}
