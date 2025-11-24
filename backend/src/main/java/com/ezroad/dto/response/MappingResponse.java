package com.ezroad.dto.response;

import com.ezroad.entity.Mapping;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class MappingResponse {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private String restaurantName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private String addressDetail;
    private LocalDateTime createdAt;

    public static MappingResponse from(Mapping mapping) {
        return MappingResponse.builder()
                .id(mapping.getId())
                .memberId(mapping.getMember().getId())
                .memberNickname(mapping.getMember().getNickname())
                .restaurantName(mapping.getRestaurantName())
                .latitude(mapping.getLatitude())
                .longitude(mapping.getLongitude())
                .address(mapping.getAddress())
                .addressDetail(mapping.getAddressDetail())
                .createdAt(mapping.getCreatedAt())
                .build();
    }
}
