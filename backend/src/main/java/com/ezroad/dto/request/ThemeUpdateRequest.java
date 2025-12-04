package com.ezroad.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ThemeUpdateRequest {

    @Size(max = 100, message = "제목은 100자 이내여야 합니다")
    private String title;

    private String description;

    private String thumbnail;

    private Boolean isPublic;
}
