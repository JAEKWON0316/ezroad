package com.ezroad.service;

import com.ezroad.entity.Member;
import com.ezroad.entity.Theme;
import com.ezroad.entity.ThemeLike;
import com.ezroad.exception.DuplicateResourceException;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.ThemeLikeRepository;
import com.ezroad.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThemeLikeService {

    private final ThemeLikeRepository themeLikeRepository;
    private final ThemeRepository themeRepository;
    private final MemberRepository memberRepository;

    // 좋아요
    @Transactional
    public void likeTheme(Long themeId, Long memberId) {
        if (themeLikeRepository.existsByThemeIdAndMemberId(themeId, memberId)) {
            throw new DuplicateResourceException("이미 좋아요한 테마입니다.");
        }

        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("테마를 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("회원을 찾을 수 없습니다."));

        ThemeLike themeLike = ThemeLike.builder()
                .theme(theme)
                .member(member)
                .build();

        themeLikeRepository.save(themeLike);
        theme.incrementLikeCount();
    }

    // 좋아요 취소
    @Transactional
    public void unlikeTheme(Long themeId, Long memberId) {
        ThemeLike themeLike = themeLikeRepository.findByThemeIdAndMemberId(themeId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("좋아요 기록을 찾을 수 없습니다."));

        Theme theme = themeLike.getTheme();
        themeLikeRepository.delete(themeLike);
        theme.decrementLikeCount();
    }

    // 좋아요 여부 확인
    public boolean isLiked(Long themeId, Long memberId) {
        return themeLikeRepository.existsByThemeIdAndMemberId(themeId, memberId);
    }

    // 좋아요 수 조회
    public long getLikeCount(Long themeId) {
        return themeLikeRepository.countByThemeId(themeId);
    }

    // 내가 좋아요한 테마 ID 목록
    public List<Long> getMyLikedThemeIds(Long memberId) {
        return themeLikeRepository.findByMemberIdWithTheme(memberId).stream()
                .map(tl -> tl.getTheme().getId())
                .collect(Collectors.toList());
    }
}
