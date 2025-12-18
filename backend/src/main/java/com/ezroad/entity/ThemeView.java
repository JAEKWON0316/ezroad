package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "theme_views", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"theme_id", "viewer_identifier", "viewed_at"}),
       indexes = {
           @Index(name = "idx_theme_views_theme_viewer", columnList = "theme_id, viewer_identifier"),
           @Index(name = "idx_theme_views_viewed_at", columnList = "viewed_at")
       })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ThemeView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theme_id", nullable = false)
    private Theme theme;

    @Column(name = "viewer_identifier", nullable = false, length = 100)
    private String viewerIdentifier;

    @CreatedDate
    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt;
}
