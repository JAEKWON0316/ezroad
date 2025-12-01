package com.ezroad.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class RestaurantUpdateRequest {

    private String name;
    private String category;
    private String description;
    private String phone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String website;
    private String businessHours;
    private String notice;
    private String thumbnail;
    private String menuBoardImage;
}
