package com.ezroad.controller;

import com.ezroad.dto.request.MemberRegisterRequest;
import com.ezroad.dto.response.MemberResponse;
import com.ezroad.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> getMyInfo(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.getMemberById(memberId));
    }

    // 내 정보 수정
    @PutMapping("/me")
    public ResponseEntity<MemberResponse> updateMyInfo(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody com.ezroad.dto.request.MemberUpdateRequest request) {
        return ResponseEntity.ok(memberService.updateMember(memberId, request));
    }

    // 회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal Long memberId) {
        memberService.deleteMember(memberId);
        return ResponseEntity.noContent().build();
    }

    // 내 통계 조회
    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Long>> getMyStats(@AuthenticationPrincipal Long memberId) {
        Map<String, Long> stats = new HashMap<>();
        stats.put("followerCount", memberService.getFollowerCount(memberId));
        stats.put("followingCount", memberService.getFollowingCount(memberId));
        stats.put("reviewCount", memberService.getReviewCount(memberId));
        return ResponseEntity.ok(stats);
    }
}
