package com.ezroad.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ThemeReorderRequest {

    @NotEmpty(message = "식당 ID 목록은 필수입니다")
    private List<Long> restaurantIds;
}
