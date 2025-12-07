package com.ezroad.repository;

import com.ezroad.entity.Report;
import com.ezroad.entity.Report.ReportStatus;
import com.ezroad.entity.Report.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 상태별 신고 목록 (페이징)
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    // 전체 신고 목록 (페이징)
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 대상별 신고 목록
    List<Report> findByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);

    // 신고자별 신고 목록
    Page<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId, Pageable pageable);

    // 상태별 개수
    long countByStatus(ReportStatus status);

    // 중복 신고 확인
    boolean existsByReporterIdAndTargetTypeAndTargetId(Long reporterId, ReportTargetType targetType, Long targetId);
}
