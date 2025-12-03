package com.ezroad.service;

import com.ezroad.dto.request.MemberRegisterRequest;
import com.ezroad.dto.response.AuthResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.MemberRole;
import com.ezroad.repository.MemberRepository;
import com.ezroad.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @InjectMocks
    private MemberService memberService;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("회원가입 성공 테스트")
    void signupSuccess() {
        // given
        MemberRegisterRequest request = MemberRegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .name("Test User")
                .nickname("Tester")
                .phone("010-1234-5678")
                .build();

        Member member = Member.builder()
                .email(request.getEmail())
                .name(request.getName())
                .role(MemberRole.USER)
                .build();
        ReflectionTestUtils.setField(member, "id", 1L);

        given(memberRepository.existsByEmail(request.getEmail())).willReturn(false);
        given(memberRepository.existsByNickname(request.getNickname())).willReturn(false);
        given(passwordEncoder.encode(request.getPassword())).willReturn("encodedPassword");
        given(memberRepository.save(any(Member.class))).willReturn(member);
        given(jwtTokenProvider.generateToken(anyLong(), anyString(), anyString())).willReturn("accessToken");
        given(jwtTokenProvider.generateRefreshToken(anyLong(), anyString())).willReturn("refreshToken");

        // when
        AuthResponse response = memberService.register(request);

        // then
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getMember().getEmail()).isEqualTo(request.getEmail());
        verify(memberRepository).save(any(Member.class));
    }
}
