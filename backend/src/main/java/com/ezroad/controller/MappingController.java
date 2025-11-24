package com.ezroad.controller;

import com.ezroad.dto.request.MappingCreateRequest;
import com.ezroad.dto.response.MappingResponse;
import com.ezroad.service.MappingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/mappings")
@RequiredArgsConstructor
public class MappingController {

    private final MappingService mappingService;

    // 지도 위치 추가
    @PostMapping
    public ResponseEntity<MappingResponse> createMapping(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody MappingCreateRequest request) {
        return ResponseEntity.ok(mappingService.createMapping(memberId, request));
    }

    // 내 지도 위치 목록
    @GetMapping("/my")
    public ResponseEntity<Page<MappingResponse>> getMyMappings(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(mappingService.getMyMappings(memberId, pageable));
    }

    // 반경 내 위치 검색
    @GetMapping("/nearby")
    public ResponseEntity<List<MappingResponse>> getNearbyMappings(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm) {
        return ResponseEntity.ok(mappingService.getNearbyMappings(latitude, longitude, radiusKm));
    }

    // 지도 위치 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapping(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        mappingService.deleteMapping(id, memberId);
        return ResponseEntity.noContent().build();
    }
}
