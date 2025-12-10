package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(length = 20)
    private String phone;

    @Column(length = 10)
    private String zipcode;

    private String address;

    @Column(name = "address_detail")
    private String addressDetail;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MemberRole role = MemberRole.USER;

    @Column(name = "business_number", length = 20)
    private String businessNumber;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Provider provider = Provider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public Member(String email, String password, String name, String nickname,
                  String phone, String zipcode, String address, String addressDetail,
                  LocalDate birthDate, String profileImage, MemberRole role,
                  String businessNumber, Provider provider, String providerId) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.phone = phone;
        this.zipcode = zipcode;
        this.address = address;
        this.addressDetail = addressDetail;
        this.birthDate = birthDate;
        this.profileImage = profileImage;
        this.role = role != null ? role : MemberRole.USER;
        this.businessNumber = businessNumber;
        this.provider = provider != null ? provider : Provider.LOCAL;
        this.providerId = providerId;
    }

    // 비즈니스 로직
    public void updateInfo(String name, String nickname, String phone, 
                          String zipcode, String address, String addressDetail) {
        if (name != null) this.name = name;
        if (nickname != null) this.nickname = nickname;
        if (phone != null) this.phone = phone;
        if (zipcode != null) this.zipcode = zipcode;
        if (address != null) this.address = address;
        if (addressDetail != null) this.addressDetail = addressDetail;
    }

    public void updateProfile(String nickname, String phone, String address,
                             String addressDetail, String profileImage) {
        if (nickname != null) this.nickname = nickname;
        if (phone != null) this.phone = phone;
        if (address != null) this.address = address;
        if (addressDetail != null) this.addressDetail = addressDetail;
        if (profileImage != null) this.profileImage = profileImage;
    }

    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    public void updateRole(MemberRole role) {
        this.role = role;
    }

    public void updatePassword(String password) {
        this.password = password;
    }

    // 소셜 계정 연동 (Auto Link)
    public void linkSocialAccount(Provider provider, String providerId, String profileImage) {
        this.provider = provider;
        this.providerId = providerId;
        if (this.profileImage == null && profileImage != null) {
            this.profileImage = profileImage;
        }
    }
}
