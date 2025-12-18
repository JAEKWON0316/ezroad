package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_views", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "viewer_identifier"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReviewView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // 로그인 사용자: "member:{memberId}", 비로그인: "ip:{IP해시}"
    @Column(name = "viewer_identifier", nullable = false, length = 255)
    private String viewerIdentifier;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @Builder
    public ReviewView(Review review, String viewerIdentifier) {
        this.review = review;
        this.viewerIdentifier = viewerIdentifier;
        this.viewedAt = LocalDateTime.now();
    }
}
