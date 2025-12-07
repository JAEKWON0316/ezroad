package com.ezroad.controller;

import com.ezroad.dto.request.ReportCreateRequest;
import com.ezroad.dto.response.ReportResponse;
import com.ezroad.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 생성
     * POST /api/reports
     */
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody ReportCreateRequest request) {
        ReportResponse response = reportService.createReport(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
