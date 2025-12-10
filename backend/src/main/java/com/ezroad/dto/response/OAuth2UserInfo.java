package com.ezroad.dto.response;

import com.ezroad.entity.Provider;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OAuth2UserInfo {
    private Provider provider;
    private String providerId;
    private String email;
    private String name;
    private String nickname;
    private String profileImage;
}
