package com.ezroad.service;

import com.ezroad.dto.request.MemberLoginRequest;
import com.ezroad.dto.request.MemberRegisterRequest;
import com.ezroad.dto.response.AuthResponse;
import com.ezroad.dto.response.MemberResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.MemberRole;
import com.ezroad.exception.DuplicateResourceException;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.FollowRepository;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.ReviewRepository;
import com.ezroad.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(MemberRegisterRequest request) {
        // 이메일 중복 체크
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("이미 사용 중인 이메일입니다");
        }

        // 닉네임 중복 체크
        if (memberRepository.existsByNickname(request.getNickname())) {
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다");
        }

        // Role 결정 (사업자 번호가 있으면 BUSINESS)
        MemberRole role = request.getBusinessNumber() != null && !request.getBusinessNumber().isEmpty()
                ? MemberRole.BUSINESS : MemberRole.USER;

        // 회원 생성
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .nickname(request.getNickname())
                .phone(request.getPhone())
                .zipcode(request.getZipcode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .birthDate(request.getBirthDate())
                .role(role)
                .businessNumber(request.getBusinessNumber())
                .build();

        Member savedMember = memberRepository.save(member);

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateToken(
                savedMember.getId(),
                savedMember.getEmail(),
                savedMember.getRole().name()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                savedMember.getId(),
                savedMember.getEmail()
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .member(MemberResponse.from(savedMember))
                .build();
    }

    public AuthResponse login(MemberLoginRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new UnauthorizedException("비밀번호가 일치하지 않습니다");
        }

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateToken(
                member.getId(),
                member.getEmail(),
                member.getRole().name()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                member.getId(),
                member.getEmail()
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .member(MemberResponse.from(member))
                .build();
    }

    public MemberResponse getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse updateMember(Long id, MemberRegisterRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        member.updateInfo(
                request.getName(),
                request.getNickname(),
                request.getPhone(),
                request.getZipcode(),
                request.getAddress(),
                request.getAddressDetail()
        );

        return MemberResponse.from(member);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        member.delete();
    }

    // Refresh Token으로 Access Token 재발급
    public AuthResponse refreshAccessToken(String refreshToken) {
        // Refresh Token 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("유효하지 않은 Refresh Token입니다");
        }

        // Refresh Token에서 정보 추출
        Long memberId = jwtTokenProvider.getMemberId(refreshToken);
        String email = jwtTokenProvider.getEmail(refreshToken);

        // 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        // 새로운 Access Token 생성
        String newAccessToken = jwtTokenProvider.generateToken(
                member.getId(),
                member.getEmail(),
                member.getRole().name()
        );

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .member(MemberResponse.from(member))
                .build();
    }

    // 통계 관련 메서드
    public Long getFollowerCount(Long memberId) {
        return followRepository.countByFollowingIdAndFollowerIsNotNull(memberId);
    }

    public Long getFollowingCount(Long memberId) {
        return followRepository.countByFollowerIdAndFollowingIsNotNull(memberId);
    }

    public Long getReviewCount(Long memberId) {
        return reviewRepository.countByMemberIdAndDeletedAtIsNull(memberId);
    }
}
