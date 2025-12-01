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

@Entity
@Table(name = "menus")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String thumbnail;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Menu(Restaurant restaurant, String name, Integer price,
                String description, String thumbnail, Boolean isVisible,
                Integer sortOrder) {
        this.restaurant = restaurant;
        this.name = name;
        this.price = price;
        this.description = description;
        this.thumbnail = thumbnail;
        this.isVisible = isVisible != null ? isVisible : true;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public void update(String name, Integer price, String description, String thumbnail) {
        if (name != null) this.name = name;
        if (price != null) this.price = price;
        if (description != null) this.description = description;
        if (thumbnail != null) this.thumbnail = thumbnail;
    }

    public void update(String name, Integer price, String description) {
        if (name != null) this.name = name;
        if (price != null) this.price = price;
        if (description != null) this.description = description;
    }

    public void toggleVisibility() {
        this.isVisible = !this.isVisible;
    }

    public void hide() {
        this.isVisible = false;
    }
}
