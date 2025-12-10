package com.ezroad.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "oauth2")
@Getter
@Setter
public class OAuth2Properties {

    private Kakao kakao = new Kakao();
    private Naver naver = new Naver();
    private Google google = new Google();
    private String frontendUrl;

    @Getter
    @Setter
    public static class Kakao {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Getter
    @Setter
    public static class Naver {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Getter
    @Setter
    public static class Google {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }
}
