package com.ezroad.dto;

import com.ezroad.entity.PublicRestaurant;
import lombok.*;
import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicRestaurantDetailDto {
    
    private Long id;
    private String externalId;
    private String name;
    private String branchName;
    private String category;
    private String subCategory;
    private String sido;
    private String sigungu;
    private String dong;
    private String address;
    private String zipcode;
    private String buildingName;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String detailInfo;
    
    public static PublicRestaurantDetailDto from(PublicRestaurant entity) {
        return PublicRestaurantDetailDto.builder()
                .id(entity.getId())
                .externalId(entity.getExternalId())
                .name(entity.getName())
                .branchName(entity.getBranchName())
                .category(entity.getCategory())
                .subCategory(entity.getSubCategory())
                .sido(entity.getSido())
                .sigungu(entity.getSigungu())
                .dong(entity.getDong())
                .address(entity.getAddress())
                .zipcode(entity.getZipcode())
                .buildingName(entity.getBuildingName())
                .longitude(entity.getLongitude())
                .latitude(entity.getLatitude())
                .detailInfo(entity.getDetailInfo())
                .build();
    }
}
