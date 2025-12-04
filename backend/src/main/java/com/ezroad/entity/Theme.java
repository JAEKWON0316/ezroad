package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "themes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String thumbnail;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "theme", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ThemeRestaurant> themeRestaurants = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Theme(Member member, String title, String description, 
                 String thumbnail, Boolean isPublic) {
        this.member = member;
        this.title = title;
        this.description = description;
        this.thumbnail = thumbnail;
        this.isPublic = isPublic != null ? isPublic : true;
        this.viewCount = 0;
    }

    public void update(String title, String description, String thumbnail, Boolean isPublic) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (thumbnail != null) this.thumbnail = thumbnail;
        if (isPublic != null) this.isPublic = isPublic;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public int getRestaurantCount() {
        return this.themeRestaurants.size();
    }
}
