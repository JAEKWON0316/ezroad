package com.ezroad.service;

import com.ezroad.dto.response.FollowResponse;
import com.ezroad.entity.Follow;
import com.ezroad.entity.Member;
import com.ezroad.entity.Restaurant;
import com.ezroad.exception.DuplicateResourceException;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.FollowRepository;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.RestaurantRepository;
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
public class FollowService {

    private final FollowRepository followRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;

    // 팔로우 추가
    @Transactional
    public void followRestaurant(Long memberId, Long restaurantId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        // 이미 팔로우 중인지 확인
        if (followRepository.existsByMemberIdAndRestaurantId(memberId, restaurantId)) {
            throw new DuplicateResourceException("이미 팔로우한 식당입니다");
        }

        Follow follow = Follow.builder()
                .follower(member)
                .restaurant(restaurant)
                .build();

        followRepository.save(follow);
    }

    // 팔로우 취소
    @Transactional
    public void unfollowRestaurant(Long memberId, Long restaurantId) {
        Follow follow = followRepository.findByMemberIdAndRestaurantId(memberId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("팔로우하지 않은 식당입니다"));

        followRepository.delete(follow);
    }

    // 내가 팔로우한 식당 목록 (상세 정보)
    public Page<FollowResponse> getMyFollowedRestaurants(Long memberId, Pageable pageable) {
        Page<Follow> follows = followRepository.findByMemberIdWithRestaurant(memberId, pageable);
        return follows.map(FollowResponse::from);
    }

    // 내가 팔로우한 식당 ID 목록
    public List<Long> getMyFollowedRestaurantIds(Long memberId) {
        return followRepository.findRestaurantIdsByMemberId(memberId);
    }

    // 팔로우 여부 확인
    public boolean isFollowing(Long memberId, Long restaurantId) {
        return followRepository.existsByMemberIdAndRestaurantId(memberId, restaurantId);
    }

    // 식당의 팔로워 수
    public Long getFollowerCount(Long restaurantId) {
        return followRepository.countByRestaurantId(restaurantId);
    }
}
