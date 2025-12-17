package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "public_restaurants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PublicRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false, unique = true, length = 30)
    private String externalId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "branch_name", length = 100)
    private String branchName;

    @Column(length = 50)
    private String category;

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    @Column(length = 20)
    private String sido;

    @Column(length = 50)
    private String sigungu;

    @Column(length = 30)
    private String dong;

    @Column(length = 300)
    private String address;

    @Column(length = 10)
    private String zipcode;

    @Column(name = "building_name", length = 100)
    private String buildingName;

    @Column(precision = 16, scale = 13)
    private BigDecimal longitude;

    @Column(precision = 15, scale = 13)
    private BigDecimal latitude;

    @Column(name = "detail_info", length = 50)
    private String detailInfo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
