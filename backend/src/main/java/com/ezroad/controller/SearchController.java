package com.ezroad.controller;

import com.ezroad.dto.response.SearchKeywordResponse;
import com.ezroad.service.SearchKeywordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchKeywordService searchKeywordService;

    /**
     * 검색어 기록
     * POST /api/search/record
     */
    @PostMapping("/record")
    public ResponseEntity<Map<String, String>> recordSearch(
            @RequestBody Map<String, String> request) {
        String keyword = request.get("keyword");
        searchKeywordService.recordSearch(keyword);
        return ResponseEntity.ok(Map.of("message", "검색어가 기록되었습니다"));
    }

    /**
     * 인기 검색어 TOP 10
     * GET /api/search/popular
     */
    @GetMapping("/popular")
    public ResponseEntity<List<SearchKeywordResponse>> getPopularKeywords() {
        List<SearchKeywordResponse> keywords = searchKeywordService.getPopularKeywords();
        return ResponseEntity.ok(keywords);
    }

    /**
     * 최근 검색어 TOP 10
     * GET /api/search/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<List<SearchKeywordResponse>> getRecentKeywords() {
        List<SearchKeywordResponse> keywords = searchKeywordService.getRecentKeywords();
        return ResponseEntity.ok(keywords);
    }
}
