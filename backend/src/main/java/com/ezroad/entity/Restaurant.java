package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Member owner;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String phone;

    @Column(length = 10)
    private String zipcode;

    private String address;

    @Column(name = "address_detail")
    private String addressDetail;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(length = 500)
    private String website;

    @Column(name = "business_hours", length = 500)
    private String businessHours;

    @Column(columnDefinition = "TEXT")
    private String notice;

    @Column(length = 500)
    private String thumbnail;

    @Column(name = "menu_board_image", length = 500)
    private String menuBoardImage;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private RestaurantStatus status = RestaurantStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Restaurant(Member owner, String name, String category, String description,
                     String phone, String zipcode, String address, String addressDetail,
                     BigDecimal latitude, BigDecimal longitude, String website,
                     String businessHours, String notice, String thumbnail, String menuBoardImage) {
        this.owner = owner;
        this.name = name;
        this.category = category;
        this.description = description;
        this.phone = phone;
        this.zipcode = zipcode;
        this.address = address;
        this.addressDetail = addressDetail;
        this.latitude = latitude;
        this.longitude = longitude;
        this.website = website;
        this.businessHours = businessHours;
        this.notice = notice;
        this.thumbnail = thumbnail;
        this.menuBoardImage = menuBoardImage;
    }

    // 비즈니스 로직
    public void updateInfo(String name, String category, String description,
                          String phone, String address, String addressDetail,
                          String website, String businessHours, String notice) {
        if (name != null) this.name = name;
        if (category != null) this.category = category;
        if (description != null) this.description = description;
        if (phone != null) this.phone = phone;
        if (address != null) this.address = address;
        if (addressDetail != null) this.addressDetail = addressDetail;
        if (website != null) this.website = website;
        if (businessHours != null) this.businessHours = businessHours;
        if (notice != null) this.notice = notice;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void updateRating(BigDecimal avgRating, Integer reviewCount) {
        this.avgRating = avgRating;
        this.reviewCount = reviewCount;
    }

    public void updateStatus(RestaurantStatus status) {
        this.status = status;
    }

    public void updateThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateCategory(String category) {
        this.category = category;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public void updatePhone(String phone) {
        this.phone = phone;
    }

    public void updateAddress(String zipcode, String address, String addressDetail) {
        this.zipcode = zipcode;
        this.address = address;
        this.addressDetail = addressDetail;
    }

    public void updateLocation(BigDecimal latitude, BigDecimal longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void updateWebsite(String website) {
        this.website = website;
    }

    public void updateBusinessHours(String businessHours) {
        this.businessHours = businessHours;
    }

    public void updateNotice(String notice) {
        this.notice = notice;
    }

    public void updateMenuBoardImage(String menuBoardImage) {
        this.menuBoardImage = menuBoardImage;
    }
}
