package com.ezroad.dto.response;

import com.ezroad.entity.Report;
import com.ezroad.entity.Report.ReportStatus;
import com.ezroad.entity.Report.ReportTargetType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReportResponse {
    private Long id;
    private ReportTargetType targetType;
    private Long targetId;
    private String reason;
    private String description;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String adminNote;
    
    // 신고자 정보
    private Long reporterId;
    private String reporterNickname;
    
    // 처리자 정보
    private Long resolvedById;
    private String resolvedByNickname;

    public static ReportResponse from(Report report) {
        ReportResponseBuilder builder = ReportResponse.builder()
                .id(report.getId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .adminNote(report.getAdminNote())
                .reporterId(report.getReporter().getId())
                .reporterNickname(report.getReporter().getNickname());
        
        if (report.getResolvedBy() != null) {
            builder.resolvedById(report.getResolvedBy().getId())
                   .resolvedByNickname(report.getResolvedBy().getNickname());
        }
        
        return builder.build();
    }
}
