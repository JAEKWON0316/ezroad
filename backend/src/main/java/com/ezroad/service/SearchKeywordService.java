package com.ezroad.service;

import com.ezroad.dto.response.SearchKeywordResponse;
import com.ezroad.entity.SearchKeyword;
import com.ezroad.repository.SearchKeywordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchKeywordService {

    private final SearchKeywordRepository searchKeywordRepository;

    /**
     * 검색어 기록 (검색 시 호출)
     */
    @Transactional
    public void recordSearch(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return;
        }

        String normalizedKeyword = keyword.trim().toLowerCase();
        
        // 너무 짧은 키워드 무시
        if (normalizedKeyword.length() < 2) {
            return;
        }

        searchKeywordRepository.findByKeyword(normalizedKeyword)
                .ifPresentOrElse(
                        SearchKeyword::incrementSearchCount,
                        () -> searchKeywordRepository.save(
                                SearchKeyword.builder()
                                        .keyword(normalizedKeyword)
                                        .build()
                        )
                );
    }

    /**
     * 인기 검색어 TOP 10 조회
     */
    public List<SearchKeywordResponse> getPopularKeywords() {
        return searchKeywordRepository.findTop10ByOrderBySearchCountDesc()
                .stream()
                .map(SearchKeywordResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 최근 검색어 TOP 10 조회
     */
    public List<SearchKeywordResponse> getRecentKeywords() {
        return searchKeywordRepository.findTop10ByOrderByLastSearchedAtDesc()
                .stream()
                .map(SearchKeywordResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 검색어 삭제 (관리자용)
     */
    @Transactional
    public void deleteKeyword(Long id) {
        searchKeywordRepository.deleteById(id);
        log.info("Deleted search keyword with id: {}", id);
    }

    /**
     * 모든 검색어 조회 (관리자용)
     */
    public List<SearchKeywordResponse> getAllKeywords() {
        return searchKeywordRepository.findAll()
                .stream()
                .map(SearchKeywordResponse::from)
                .collect(Collectors.toList());
    }
}
