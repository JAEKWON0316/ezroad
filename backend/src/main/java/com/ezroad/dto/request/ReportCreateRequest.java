package com.ezroad.dto.request;

import com.ezroad.entity.Report.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportCreateRequest {

    @NotNull(message = "신고 대상 타입은 필수입니다")
    private ReportTargetType targetType;

    @NotNull(message = "신고 대상 ID는 필수입니다")
    private Long targetId;

    @NotBlank(message = "신고 사유는 필수입니다")
    private String reason;

    private String description;
}
