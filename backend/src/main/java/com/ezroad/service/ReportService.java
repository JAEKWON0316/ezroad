package com.ezroad.service;

import com.ezroad.dto.request.ReportCreateRequest;
import com.ezroad.dto.response.ReportResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Report;
import com.ezroad.entity.Report.ReportStatus;
import com.ezroad.exception.DuplicateResourceException;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;

    /**
     * 신고 생성
     */
    @Transactional
    public ReportResponse createReport(Long reporterId, ReportCreateRequest request) {
        Member reporter = memberRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("회원을 찾을 수 없습니다"));

        // 중복 신고 확인
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId, request.getTargetType(), request.getTargetId())) {
            throw new DuplicateResourceException("이미 신고한 내용입니다");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .description(request.getDescription())
                .build();

        Report saved = reportRepository.save(report);
        log.info("Report created: id={}, targetType={}, targetId={}", 
                saved.getId(), request.getTargetType(), request.getTargetId());

        return ReportResponse.from(saved);
    }

    /**
     * 신고 목록 조회 (관리자)
     */
    public Page<ReportResponse> getReports(ReportStatus status, Pageable pageable) {
        Page<Report> reports;
        if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else {
            reports = reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return reports.map(ReportResponse::from);
    }

    /**
     * 신고 상세 조회
     */
    public ReportResponse getReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("신고를 찾을 수 없습니다"));
        return ReportResponse.from(report);
    }

    /**
     * 신고 처리 (관리자)
     */
    @Transactional
    public ReportResponse resolveReport(Long reportId, Long adminId, String adminNote) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("신고를 찾을 수 없습니다"));

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("관리자를 찾을 수 없습니다"));

        report.resolve(admin, adminNote);
        log.info("Report resolved: id={}, adminId={}", reportId, adminId);

        return ReportResponse.from(report);
    }

    /**
     * 신고 기각 (관리자)
     */
    @Transactional
    public ReportResponse dismissReport(Long reportId, Long adminId, String adminNote) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("신고를 찾을 수 없습니다"));

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("관리자를 찾을 수 없습니다"));

        report.dismiss(admin, adminNote);
        log.info("Report dismissed: id={}, adminId={}", reportId, adminId);

        return ReportResponse.from(report);
    }

    /**
     * 신고 통계 (관리자)
     */
    public Map<String, Long> getReportStats() {
        return Map.of(
                "pending", reportRepository.countByStatus(ReportStatus.PENDING),
                "resolved", reportRepository.countByStatus(ReportStatus.RESOLVED),
                "dismissed", reportRepository.countByStatus(ReportStatus.DISMISSED),
                "total", reportRepository.count()
        );
    }
}
