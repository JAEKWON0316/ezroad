package com.ezroad.service;

import com.ezroad.config.OAuth2Properties;
import com.ezroad.dto.response.AuthResponse;
import com.ezroad.dto.response.MemberResponse;
import com.ezroad.dto.response.OAuth2UserInfo;
import com.ezroad.entity.Member;
import com.ezroad.entity.MemberOAuth;
import com.ezroad.entity.MemberRole;
import com.ezroad.entity.Provider;
import com.ezroad.repository.MemberOAuthRepository;
import com.ezroad.repository.MemberRepository;
import com.ezroad.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {

    private final OAuth2Properties oAuth2Properties;
    private final MemberRepository memberRepository;
    private final MemberOAuthRepository memberOAuthRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== 로그인 URL 생성 ====================

    public String getKakaoLoginUrl() {
        return "https://kauth.kakao.com/oauth/authorize"
                + "?client_id=" + oAuth2Properties.getKakao().getClientId()
                + "&redirect_uri=" + URLEncoder.encode(oAuth2Properties.getKakao().getRedirectUri(), StandardCharsets.UTF_8)
                + "&response_type=code";
    }

    public String getNaverLoginUrl() {
        String state = UUID.randomUUID().toString();
        return "https://nid.naver.com/oauth2.0/authorize"
                + "?client_id=" + oAuth2Properties.getNaver().getClientId()
                + "&redirect_uri=" + URLEncoder.encode(oAuth2Properties.getNaver().getRedirectUri(), StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&state=" + state;
    }

    public String getGoogleLoginUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + oAuth2Properties.getGoogle().getClientId()
                + "&redirect_uri=" + URLEncoder.encode(oAuth2Properties.getGoogle().getRedirectUri(), StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=" + URLEncoder.encode("email profile", StandardCharsets.UTF_8);
    }

    // ==================== 콜백 처리 ====================

    @Transactional
    public AuthResponse processKakaoCallback(String code) {
        String accessToken = getKakaoAccessToken(code);
        OAuth2UserInfo userInfo = getKakaoUserInfo(accessToken);
        return processOAuth2Login(userInfo);
    }

    @Transactional
    public AuthResponse processNaverCallback(String code, String state) {
        String accessToken = getNaverAccessToken(code, state);
        OAuth2UserInfo userInfo = getNaverUserInfo(accessToken);
        return processOAuth2Login(userInfo);
    }

    @Transactional
    public AuthResponse processGoogleCallback(String code) {
        String accessToken = getGoogleAccessToken(code);
        OAuth2UserInfo userInfo = getGoogleUserInfo(accessToken);
        return processOAuth2Login(userInfo);
    }

    // ==================== 카카오 API ====================

    private String getKakaoAccessToken(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oAuth2Properties.getKakao().getClientId());
        params.add("redirect_uri", oAuth2Properties.getKakao().getRedirectUri());
        params.add("code", code);
        
        String clientSecret = oAuth2Properties.getKakao().getClientSecret();
        if (clientSecret != null && !clientSecret.isEmpty()) {
            params.add("client_secret", clientSecret);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("카카오 토큰 교환 실패: {}", e.getMessage());
            throw new RuntimeException("카카오 로그인 실패", e);
        }
    }

    private OAuth2UserInfo getKakaoUserInfo(String accessToken) {
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            String id = jsonNode.get("id").asText();
            JsonNode kakaoAccount = jsonNode.get("kakao_account");
            JsonNode profile = kakaoAccount.get("profile");

            String email = kakaoAccount.has("email") ? kakaoAccount.get("email").asText() : id + "@kakao.user";
            String nickname = profile.has("nickname") ? profile.get("nickname").asText() : "카카오유저";
            String profileImage = profile.has("profile_image_url") ? profile.get("profile_image_url").asText() : null;

            return OAuth2UserInfo.builder()
                    .provider(Provider.KAKAO)
                    .providerId(id)
                    .email(email)
                    .name(nickname)
                    .nickname(nickname)
                    .profileImage(profileImage)
                    .build();
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 실패: {}", e.getMessage());
            throw new RuntimeException("카카오 사용자 정보 조회 실패", e);
        }
    }

    // ==================== 네이버 API ====================

    private String getNaverAccessToken(String code, String state) {
        String tokenUrl = "https://nid.naver.com/oauth2.0/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oAuth2Properties.getNaver().getClientId());
        params.add("client_secret", oAuth2Properties.getNaver().getClientSecret());
        params.add("redirect_uri", oAuth2Properties.getNaver().getRedirectUri());
        params.add("code", code);
        params.add("state", state);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("네이버 토큰 교환 실패: {}", e.getMessage());
            throw new RuntimeException("네이버 로그인 실패", e);
        }
    }

    private OAuth2UserInfo getNaverUserInfo(String accessToken) {
        String userInfoUrl = "https://openapi.naver.com/v1/nid/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            JsonNode responseNode = jsonNode.get("response");

            String id = responseNode.get("id").asText();
            String email = responseNode.has("email") ? responseNode.get("email").asText() : id + "@naver.user";
            String name = responseNode.has("name") ? responseNode.get("name").asText() : "네이버유저";
            String nickname = responseNode.has("nickname") ? responseNode.get("nickname").asText() : name;
            String profileImage = responseNode.has("profile_image") ? responseNode.get("profile_image").asText() : null;

            return OAuth2UserInfo.builder()
                    .provider(Provider.NAVER)
                    .providerId(id)
                    .email(email)
                    .name(name)
                    .nickname(nickname)
                    .profileImage(profileImage)
                    .build();
        } catch (Exception e) {
            log.error("네이버 사용자 정보 조회 실패: {}", e.getMessage());
            throw new RuntimeException("네이버 사용자 정보 조회 실패", e);
        }
    }

    // ==================== 구글 API ====================

    private String getGoogleAccessToken(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oAuth2Properties.getGoogle().getClientId());
        params.add("client_secret", oAuth2Properties.getGoogle().getClientSecret());
        params.add("redirect_uri", oAuth2Properties.getGoogle().getRedirectUri());
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("구글 토큰 교환 실패: {}", e.getMessage());
            throw new RuntimeException("구글 로그인 실패", e);
        }
    }

    private OAuth2UserInfo getGoogleUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            String id = jsonNode.get("id").asText();
            String email = jsonNode.has("email") ? jsonNode.get("email").asText() : id + "@google.user";
            String name = jsonNode.has("name") ? jsonNode.get("name").asText() : "구글유저";
            String profileImage = jsonNode.has("picture") ? jsonNode.get("picture").asText() : null;

            return OAuth2UserInfo.builder()
                    .provider(Provider.GOOGLE)
                    .providerId(id)
                    .email(email)
                    .name(name)
                    .nickname(name)
                    .profileImage(profileImage)
                    .build();
        } catch (Exception e) {
            log.error("구글 사용자 정보 조회 실패: {}", e.getMessage());
            throw new RuntimeException("구글 사용자 정보 조회 실패", e);
        }
    }

    // ==================== 공통 로그인 처리 (member_oauth 테이블 사용) ====================

    private AuthResponse processOAuth2Login(OAuth2UserInfo userInfo) {
        // 1. member_oauth에서 provider + providerId로 기존 연동 조회
        Optional<MemberOAuth> existingOAuth = memberOAuthRepository.findByProviderAndProviderId(
                userInfo.getProvider(), userInfo.getProviderId());

        Member member;
        
        if (existingOAuth.isPresent()) {
            // 기존 소셜 연동으로 로그인
            member = existingOAuth.get().getMember();
            log.info("소셜 로그인 성공 (기존 연동): {} - {}", userInfo.getProvider(), userInfo.getEmail());
        } else {
            // 2. 같은 이메일의 기존 회원 조회
            Optional<Member> existingByEmail = memberRepository.findByEmail(userInfo.getEmail());
            
            if (existingByEmail.isPresent()) {
                // 기존 회원에 소셜 연동 추가
                member = existingByEmail.get();
                
                MemberOAuth newOAuth = MemberOAuth.builder()
                        .member(member)
                        .provider(userInfo.getProvider())
                        .providerId(userInfo.getProviderId())
                        .build();
                memberOAuthRepository.save(newOAuth);
                
                // 프로필 이미지가 없으면 소셜 프로필로 업데이트
                if (member.getProfileImage() == null && userInfo.getProfileImage() != null) {
                    member.updateProfile(null, null, null, null, userInfo.getProfileImage());
                    memberRepository.save(member);
                }
                
                log.info("소셜 계정 연동 추가: {} - {}", userInfo.getProvider(), userInfo.getEmail());
            } else {
                // 3. 신규 회원 생성 + 소셜 연동
                String uniqueNickname = generateUniqueNickname(userInfo.getNickname());
                
                member = Member.builder()
                        .email(userInfo.getEmail())
                        .password(UUID.randomUUID().toString())
                        .name(userInfo.getName())
                        .nickname(uniqueNickname)
                        .profileImage(userInfo.getProfileImage())
                        .role(MemberRole.USER)
                        .build();
                member = memberRepository.save(member);
                
                // member_oauth에 연동 추가
                MemberOAuth newOAuth = MemberOAuth.builder()
                        .member(member)
                        .provider(userInfo.getProvider())
                        .providerId(userInfo.getProviderId())
                        .build();
                memberOAuthRepository.save(newOAuth);
                
                log.info("소셜 로그인 신규 가입: {} - {}", userInfo.getProvider(), userInfo.getEmail());
            }
        }

        // JWT 토큰 발급
        String accessToken = jwtTokenProvider.generateToken(member.getId(), member.getEmail(), member.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(member.getId(), member.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .member(MemberResponse.from(member))
                .build();
    }

    private String generateUniqueNickname(String baseNickname) {
        String nickname = baseNickname;
        int suffix = 1;
        
        while (memberRepository.existsByNickname(nickname)) {
            nickname = baseNickname + suffix;
            suffix++;
        }
        
        return nickname;
    }
}
