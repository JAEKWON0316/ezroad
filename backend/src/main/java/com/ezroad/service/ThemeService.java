package com.ezroad.service;

import com.ezroad.dto.request.ThemeAddRestaurantRequest;
import com.ezroad.dto.request.ThemeCreateRequest;
import com.ezroad.dto.request.ThemeReorderRequest;
import com.ezroad.dto.request.ThemeUpdateRequest;
import com.ezroad.dto.response.ThemeDetailResponse;
import com.ezroad.dto.response.ThemeResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Restaurant;
import com.ezroad.entity.Theme;
import com.ezroad.entity.ThemeRestaurant;
import com.ezroad.exception.DuplicateResourceException;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.RestaurantRepository;
import com.ezroad.repository.ThemeRepository;
import com.ezroad.repository.ThemeRestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThemeService {

    private final ThemeRepository themeRepository;
    private final ThemeRestaurantRepository themeRestaurantRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;

    /**
     * 테마 생성
     */
    @Transactional
    public ThemeResponse createTheme(Long memberId, ThemeCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        Theme theme = Theme.builder()
                .member(member)
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnail(request.getThumbnail())
                .isPublic(request.getIsPublic())
                .build();

        Theme saved = themeRepository.save(theme);
        return ThemeResponse.from(saved);
    }

    /**
     * 테마 수정
     */
    @Transactional
    public ThemeResponse updateTheme(Long memberId, Long themeId, ThemeUpdateRequest request) {
        Theme theme = getThemeWithOwnerCheck(themeId, memberId);
        theme.update(request.getTitle(), request.getDescription(), 
                     request.getThumbnail(), request.getIsPublic());
        return ThemeResponse.from(theme);
    }

    /**
     * 테마 삭제
     */
    @Transactional
    public void deleteTheme(Long memberId, Long themeId) {
        Theme theme = getThemeWithOwnerCheck(themeId, memberId);
        themeRepository.delete(theme);
    }

    /**
     * 내 테마 목록
     */
    public Page<ThemeResponse> getMyThemes(Long memberId, Pageable pageable) {
        return themeRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable)
                .map(ThemeResponse::from);
    }

    /**
     * 내 테마 목록 (전체)
     */
    public List<ThemeResponse> getMyThemesList(Long memberId) {
        return themeRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(ThemeResponse::from)
                .toList();
    }

    /**
     * 공개 테마 목록
     */
    public Page<ThemeResponse> getPublicThemes(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return themeRepository.searchPublicThemes(keyword, pageable)
                    .map(ThemeResponse::from);
        }
        return themeRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable)
                .map(ThemeResponse::from);
    }

    /**
     * 인기 테마 TOP 3
     */
    public List<ThemeResponse> getTopThemes() {
        return themeRepository.findTop3ByIsPublicTrueOrderByViewCountDesc()
                .stream()
                .map(ThemeResponse::from)
                .toList();
    }

    /**
     * 테마 상세 조회
     */
    @Transactional
    public ThemeDetailResponse getThemeDetail(Long themeId, Long memberId) {
        Theme theme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));

        // 비공개 테마는 본인만 조회 가능
        if (!theme.getIsPublic() && !theme.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("비공개 테마입니다");
        }

        // 조회수 증가 (본인 제외)
        if (memberId == null || !theme.getMember().getId().equals(memberId)) {
            theme.incrementViewCount();
        }

        return ThemeDetailResponse.from(theme);
    }

    /**
     * 테마에 식당 추가
     */
    @Transactional
    public ThemeDetailResponse addRestaurantToTheme(Long memberId, Long themeId, 
                                                     ThemeAddRestaurantRequest request) {
        Theme theme = getThemeWithOwnerCheck(themeId, memberId);
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        // 이미 추가된 식당인지 확인
        if (themeRestaurantRepository.existsByThemeIdAndRestaurantId(themeId, request.getRestaurantId())) {
            throw new DuplicateResourceException("이미 테마에 추가된 식당입니다");
        }

        // 마지막 순서 + 1
        Integer maxOrder = themeRestaurantRepository.findMaxSortOrderByThemeId(themeId);
        
        ThemeRestaurant themeRestaurant = ThemeRestaurant.builder()
                .theme(theme)
                .restaurant(restaurant)
                .sortOrder(maxOrder + 1)
                .memo(request.getMemo())
                .build();

        themeRestaurantRepository.save(themeRestaurant);

        // 새로 조회해서 반환
        Theme updatedTheme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));
        return ThemeDetailResponse.from(updatedTheme);
    }

    /**
     * 테마에서 식당 제거
     */
    @Transactional
    public ThemeDetailResponse removeRestaurantFromTheme(Long memberId, Long themeId, Long restaurantId) {
        getThemeWithOwnerCheck(themeId, memberId);

        ThemeRestaurant themeRestaurant = themeRestaurantRepository
                .findByThemeIdAndRestaurantId(themeId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("테마에 해당 식당이 없습니다"));

        themeRestaurantRepository.delete(themeRestaurant);

        // 새로 조회해서 반환
        Theme updatedTheme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));
        return ThemeDetailResponse.from(updatedTheme);
    }

    /**
     * 식당 순서 변경
     */
    @Transactional
    public ThemeDetailResponse reorderRestaurants(Long memberId, Long themeId, ThemeReorderRequest request) {
        getThemeWithOwnerCheck(themeId, memberId);

        List<ThemeRestaurant> themeRestaurants = themeRestaurantRepository
                .findByThemeIdOrderBySortOrderAsc(themeId);

        // 새로운 순서대로 업데이트
        List<Long> newOrder = request.getRestaurantIds();
        for (ThemeRestaurant tr : themeRestaurants) {
            int newIndex = newOrder.indexOf(tr.getRestaurant().getId());
            if (newIndex >= 0) {
                tr.updateSortOrder(newIndex);
            }
        }

        // 새로 조회해서 반환
        Theme updatedTheme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));
        return ThemeDetailResponse.from(updatedTheme);
    }

    /**
     * 소유권 체크
     */
    private Theme getThemeWithOwnerCheck(Long themeId, Long memberId) {
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));

        if (!theme.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("테마 수정 권한이 없습니다");
        }

        return theme;
    }
}
