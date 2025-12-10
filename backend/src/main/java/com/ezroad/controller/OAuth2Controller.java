package com.ezroad.controller;

import com.ezroad.config.OAuth2Properties;
import com.ezroad.dto.response.AuthResponse;
import com.ezroad.service.OAuth2Service;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {

    private final OAuth2Service oAuth2Service;
    private final OAuth2Properties oAuth2Properties;

    // ==================== 로그인 URL 리다이렉트 ====================

    @GetMapping("/kakao")
    public void kakaoLogin(HttpServletResponse response) throws IOException {
        String loginUrl = oAuth2Service.getKakaoLoginUrl();
        log.info("카카오 로그인 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }

    @GetMapping("/naver")
    public void naverLogin(HttpServletResponse response) throws IOException {
        String loginUrl = oAuth2Service.getNaverLoginUrl();
        log.info("네이버 로그인 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }

    @GetMapping("/google")
    public void googleLogin(HttpServletResponse response) throws IOException {
        String loginUrl = oAuth2Service.getGoogleLoginUrl();
        log.info("구글 로그인 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }

    // ==================== 콜백 처리 ====================

    @GetMapping("/callback/kakao")
    public void kakaoCallback(
            @RequestParam String code,
            @RequestParam(required = false) String error,
            @RequestParam(required = false, name = "error_description") String errorDescription,
            HttpServletResponse response) throws IOException {
        
        if (error != null) {
            log.error("카카오 로그인 에러: {} - {}", error, errorDescription);
            response.sendRedirect(oAuth2Properties.getFrontendUrl() + "/login?error=" + 
                    URLEncoder.encode("카카오 로그인 실패", StandardCharsets.UTF_8));
            return;
        }

        try {
            AuthResponse authResponse = oAuth2Service.processKakaoCallback(code);
            redirectWithToken(response, authResponse);
        } catch (Exception e) {
            log.error("카카오 콜백 처리 실패: {}", e.getMessage());
            response.sendRedirect(oAuth2Properties.getFrontendUrl() + "/login?error=" + 
                    URLEncoder.encode("카카오 로그인 처리 실패", StandardCharsets.UTF_8));
        }
    }

    @GetMapping("/callback/naver")
    public void naverCallback(
            @RequestParam String code,
            @RequestParam String state,
            @RequestParam(required = false) String error,
            @RequestParam(required = false, name = "error_description") String errorDescription,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            log.error("네이버 로그인 에러: {} - {}", error, errorDescription);
            response.sendRedirect(oAuth2Properties.getFrontendUrl() + "/login?error=" + 
                    URLEncoder.encode("네이버 로그인 실패", StandardCharsets.UTF_8));
            return;
        }

        try {
            AuthResponse authResponse = oAuth2Service.processNaverCallback(code, state);
            redirectWithToken(response, authResponse);
        } catch (Exception e) {
            log.error("네이버 콜백 처리 실패: {}", e.getMessage());
            response.sendRedirect(oAuth2Properties.getFrontendUrl() + "/login?error=" + 
                    URLEncoder.encode("네이버 로그인 처리 실패", StandardCharsets.UTF_8));
        }
    }

    @GetMapping("/callback/google")
    public void googleCallback(
            @RequestParam String code,
            @RequestParam(required = false) String error,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            log.error("구글 로그인 에러: {}", error);
            response.sendRedirect(oAuth2Properties.getFrontendUrl() + "/login?error=" + 
                    URLEncoder.encode("구글 로그인 실패", StandardCharsets.UTF_8));
            return;
        }

        try {
            AuthResponse authResponse = oAuth2Service.processGoogleCallback(code);
            redirectWithToken(response, authResponse);
        } catch (Exception e) {
            log.error("구글 콜백 처리 실패: {}", e.getMessage());
            response.sendRedirect(oAuth2Properties.getFrontendUrl() + "/login?error=" + 
                    URLEncoder.encode("구글 로그인 처리 실패", StandardCharsets.UTF_8));
        }
    }

    // ==================== 헬퍼 메서드 ====================

    private void redirectWithToken(HttpServletResponse response, AuthResponse authResponse) throws IOException {
        String redirectUrl = oAuth2Properties.getFrontendUrl() + "/oauth/callback"
                + "?accessToken=" + authResponse.getAccessToken()
                + "&refreshToken=" + authResponse.getRefreshToken();
        
        log.info("소셜 로그인 성공, 프론트엔드로 리다이렉트");
        response.sendRedirect(redirectUrl);
    }
}
