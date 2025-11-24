package com.ezroad.controller;

import com.ezroad.dto.request.MemberLoginRequest;
import com.ezroad.dto.request.MemberRegisterRequest;
import com.ezroad.dto.request.RefreshTokenRequest;
import com.ezroad.dto.response.AuthResponse;
import com.ezroad.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody MemberRegisterRequest request) {
        return ResponseEntity.ok(memberService.register(request));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody MemberLoginRequest request) {
        return ResponseEntity.ok(memberService.login(request));
    }

    // Access Token 재발급
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(memberService.refreshAccessToken(request.getRefreshToken()));
    }

    // 로그아웃 (클라이언트에서 토큰 삭제 안내)
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT는 Stateless이므로 서버에서 별도 처리 없이 클라이언트에서 토큰을 삭제하면 됨
        return ResponseEntity.ok(Map.of("message", "로그아웃되었습니다. 토큰을 삭제해주세요."));
    }
}
