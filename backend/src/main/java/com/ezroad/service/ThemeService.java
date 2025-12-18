package com.ezroad.service;

import com.ezroad.dto.request.ThemeAddRestaurantRequest;
import com.ezroad.dto.request.ThemeCreateRequest;
import com.ezroad.dto.request.ThemeReorderRequest;
import com.ezroad.dto.request.ThemeUpdateRequest;
import com.ezroad.dto.response.ThemeDetailResponse;
import com.ezroad.dto.response.ThemeResponse;
import com.ezroad.entity.*;
import com.ezroad.exception.DuplicateResourceException;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThemeService {

    private final ThemeRepository themeRepository;
    private final ThemeRestaurantRepository themeRestaurantRepository;
    private final ThemeViewRepository themeViewRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    
    // 조회수 중복 방지 시간 (24시간)
    private static final int VIEW_DEDUP_HOURS = 24;

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

    @Transactional
    public ThemeResponse updateTheme(Long memberId, Long themeId, ThemeUpdateRequest request) {
        Theme theme = getThemeWithOwnerCheck(themeId, memberId);
        theme.update(request.getTitle(), request.getDescription(), 
                     request.getThumbnail(), request.getIsPublic());
        return ThemeResponse.from(theme);
    }

    @Transactional
    public void deleteTheme(Long memberId, Long themeId) {
        Theme theme = getThemeWithOwnerCheck(themeId, memberId);
        themeRepository.delete(theme);
    }

    public Page<ThemeResponse> getMyThemes(Long memberId, Pageable pageable) {
        return themeRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable)
                .map(ThemeResponse::from);
    }

    public List<ThemeResponse> getMyThemesList(Long memberId) {
        return themeRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(ThemeResponse::from)
                .toList();
    }

    /**
     * 공개 테마 목록 (정렬 옵션 지원)
     * @param sort: createdAt(최신순), viewCount(인기순), likeCount(좋아요순)
     */
    public Page<ThemeResponse> getPublicThemes(String keyword, String sort, Pageable pageable) {
        String sortField = switch (sort) {
            case "viewCount" -> "viewCount";
            case "likeCount" -> "likeCount";
            default -> "createdAt";
        };
        
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            Sort.by(Sort.Direction.DESC, sortField)
        );

        if (keyword != null && !keyword.isBlank()) {
            return themeRepository.searchPublicThemes(keyword, sortedPageable)
                    .map(ThemeResponse::from);
        }
        return themeRepository.findByIsPublicTrue(sortedPageable)
                .map(ThemeResponse::from);
    }

    public List<ThemeResponse> getTopThemes() {
        return themeRepository.findTop3ByIsPublicTrueOrderByViewCountDesc()
                .stream()
                .map(ThemeResponse::from)
                .toList();
    }

    /**
     * 테마 상세 조회 (24시간 조회수 중복 방지)
     */
    @Transactional
    public ThemeDetailResponse getThemeDetail(Long themeId, Long memberId, String viewerIdentifier) {
        Theme theme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));

        // 비공개 테마는 본인만 조회 가능
        if (!theme.getIsPublic() && !theme.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("비공개 테마입니다");
        }

        // 본인 테마가 아닌 경우에만 조회수 처리
        if (memberId == null || !theme.getMember().getId().equals(memberId)) {
            // 24시간 내 동일 사용자 조회 여부 확인
            LocalDateTime since = LocalDateTime.now().minusHours(VIEW_DEDUP_HOURS);
            boolean hasRecentView = themeViewRepository.existsRecentView(themeId, viewerIdentifier, since);
            
            if (!hasRecentView) {
                // 새로운 조회 → 조회수 증가 + 기록 저장
                theme.incrementViewCount();
                
                ThemeView themeView = ThemeView.builder()
                        .theme(theme)
                        .viewerIdentifier(viewerIdentifier)
                        .build();
                themeViewRepository.save(themeView);
                
                log.debug("테마 #{} 조회수 증가: {} (viewer: {})", themeId, theme.getViewCount(), viewerIdentifier);
            } else {
                log.debug("테마 #{} 중복 조회 차단 (viewer: {})", themeId, viewerIdentifier);
            }
        }

        return ThemeDetailResponse.from(theme);
    }
    
    /**
     * 기존 호환성을 위한 오버로드 (viewerIdentifier 없이 호출 시)
     */
    @Transactional
    public ThemeDetailResponse getThemeDetail(Long themeId, Long memberId) {
        Theme theme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));

        if (!theme.getIsPublic() && !theme.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("비공개 테마입니다");
        }

        // viewerIdentifier 없이 호출되면 항상 조회수 증가 (레거시 동작)
        if (memberId == null || !theme.getMember().getId().equals(memberId)) {
            theme.incrementViewCount();
        }

        return ThemeDetailResponse.from(theme);
    }

    @Transactional
    public ThemeDetailResponse addRestaurantToTheme(Long memberId, Long themeId, 
                                                     ThemeAddRestaurantRequest request) {
        Theme theme = getThemeWithOwnerCheck(themeId, memberId);
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        if (themeRestaurantRepository.existsByThemeIdAndRestaurantId(themeId, request.getRestaurantId())) {
            throw new DuplicateResourceException("이미 테마에 추가된 식당입니다");
        }

        Integer maxOrder = themeRestaurantRepository.findMaxSortOrderByThemeId(themeId);
        
        ThemeRestaurant themeRestaurant = ThemeRestaurant.builder()
                .theme(theme)
                .restaurant(restaurant)
                .sortOrder(maxOrder + 1)
                .memo(request.getMemo())
                .build();

        themeRestaurantRepository.save(themeRestaurant);

        Theme updatedTheme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));
        return ThemeDetailResponse.from(updatedTheme);
    }

    @Transactional
    public ThemeDetailResponse removeRestaurantFromTheme(Long memberId, Long themeId, Long restaurantId) {
        getThemeWithOwnerCheck(themeId, memberId);

        ThemeRestaurant themeRestaurant = themeRestaurantRepository
                .findByThemeIdAndRestaurantId(themeId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("테마에 해당 식당이 없습니다"));

        themeRestaurantRepository.delete(themeRestaurant);

        Theme updatedTheme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));
        return ThemeDetailResponse.from(updatedTheme);
    }

    @Transactional
    public ThemeDetailResponse reorderRestaurants(Long memberId, Long themeId, ThemeReorderRequest request) {
        getThemeWithOwnerCheck(themeId, memberId);

        List<ThemeRestaurant> themeRestaurants = themeRestaurantRepository
                .findByThemeIdOrderBySortOrderAsc(themeId);

        List<Long> newOrder = request.getRestaurantIds();
        for (ThemeRestaurant tr : themeRestaurants) {
            int newIndex = newOrder.indexOf(tr.getRestaurant().getId());
            if (newIndex >= 0) {
                tr.updateSortOrder(newIndex);
            }
        }

        Theme updatedTheme = themeRepository.findByIdWithRestaurants(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));
        return ThemeDetailResponse.from(updatedTheme);
    }

    private Theme getThemeWithOwnerCheck(Long themeId, Long memberId) {
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 테마입니다"));

        if (!theme.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("테마 수정 권한이 없습니다");
        }

        return theme;
    }
}
