package com.ezroad.dto.response;

import com.ezroad.entity.SearchKeyword;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SearchKeywordResponse {
    private Long id;
    private String keyword;
    private Long searchCount;
    private LocalDateTime lastSearchedAt;

    public static SearchKeywordResponse from(SearchKeyword searchKeyword) {
        return SearchKeywordResponse.builder()
                .id(searchKeyword.getId())
                .keyword(searchKeyword.getKeyword())
                .searchCount(searchKeyword.getSearchCount())
                .lastSearchedAt(searchKeyword.getLastSearchedAt())
                .build();
    }
}
