package com.ezroad.dto;

import com.ezroad.entity.PublicRestaurant;
import lombok.*;
import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicRestaurantMapDto {
    
    private Long id;
    private String name;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String category;
    
    public static PublicRestaurantMapDto from(PublicRestaurant entity) {
        return PublicRestaurantMapDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .category(entity.getCategory())
                .build();
    }
}
