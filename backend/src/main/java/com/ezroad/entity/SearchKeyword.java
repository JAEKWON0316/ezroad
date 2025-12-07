package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_keywords")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class SearchKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String keyword;

    @Column(name = "search_count", nullable = false)
    private Long searchCount = 1L;

    @Column(name = "last_searched_at")
    private LocalDateTime lastSearchedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public SearchKeyword(String keyword) {
        this.keyword = keyword.trim().toLowerCase();
        this.searchCount = 1L;
        this.lastSearchedAt = LocalDateTime.now();
    }

    public void incrementSearchCount() {
        this.searchCount++;
        this.lastSearchedAt = LocalDateTime.now();
    }
}
