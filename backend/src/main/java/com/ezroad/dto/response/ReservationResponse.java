package com.ezroad.dto.response;

import com.ezroad.entity.Reservation;
import com.ezroad.entity.ReservationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
public class ReservationResponse {
    
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private Long memberId;
    private String memberName;
    private String memberPhone;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer guestCount;
    private String request;
    private ReservationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReservationResponse from(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .restaurantId(reservation.getRestaurant().getId())
                .restaurantName(reservation.getRestaurant().getName())
                .restaurantAddress(reservation.getRestaurant().getAddress())
                .restaurantPhone(reservation.getRestaurant().getPhone())
                .memberId(reservation.getMember().getId())
                .memberName(reservation.getMember().getName())
                .memberPhone(reservation.getMember().getPhone())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .guestCount(reservation.getGuestCount())
                .request(reservation.getRequest())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}
