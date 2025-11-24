package com.ezroad.dto.response;

import com.ezroad.entity.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponse {
    
    private Long id;
    private String email;
    private String name;
    private String nickname;
    private String phone;
    private String address;
    private String addressDetail;
    private LocalDate birthDate;
    private String profileImage;
    private String role;
    private LocalDateTime createdAt;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .nickname(member.getNickname())
                .phone(member.getPhone())
                .address(member.getAddress())
                .addressDetail(member.getAddressDetail())
                .birthDate(member.getBirthDate())
                .profileImage(member.getProfileImage())
                .role(member.getRole().name())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
