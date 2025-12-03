package com.ezroad.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MenuCreateRequest {

    @NotNull(message = "식당 ID는 필수입니다")
    private Long restaurantId;

    @NotBlank(message = "메뉴명은 필수입니다")
    private String name;

    @NotNull(message = "가격은 필수입니다")
    @Positive(message = "가격은 양수여야 합니다")
    private Integer price;

    private String description;

    private String thumbnail;
}
