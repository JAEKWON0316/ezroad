package com.ezroad.dto.response;

import com.ezroad.entity.Menu;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MenuResponse {

    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String name;
    private Integer price;
    private String description;
    private String thumbnail;
    private Boolean isVisible;
    private LocalDateTime createdAt;

    public static MenuResponse from(Menu menu) {
        return MenuResponse.builder()
                .id(menu.getId())
                .restaurantId(menu.getRestaurant().getId())
                .restaurantName(menu.getRestaurant().getName())
                .name(menu.getName())
                .price(menu.getPrice())
                .description(menu.getDescription())
                .thumbnail(menu.getThumbnail())
                .isVisible(menu.getIsVisible())
                .createdAt(menu.getCreatedAt())
                .build();
    }
}
