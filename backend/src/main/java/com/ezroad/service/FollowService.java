package com.ezroad.service;

import com.ezroad.dto.response.FollowResponse;
import com.ezroad.dto.response.MemberResponse;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.entity.Follow;
import com.ezroad.entity.Member;
import com.ezroad.entity.NotificationType;
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
    private final NotificationService notificationService;

    // ==================== 식당 팔로우 ====================

    @Transactional
    public void followRestaurant(Long memberId, Long restaurantId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        if (followRepository.existsByMemberIdAndRestaurantId(memberId, restaurantId)) {
            throw new DuplicateResourceException("이미 팔로우한 식당입니다");
        }

        Follow follow = Follow.builder()
                .follower(member)
                .restaurant(restaurant)
                .build();

        followRepository.save(follow);
    }

    @Transactional
    public void unfollowRestaurant(Long memberId, Long restaurantId) {
        Follow follow = followRepository.findByMemberIdAndRestaurantId(memberId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("팔로우하지 않은 식당입니다"));

        followRepository.delete(follow);
    }

    public Page<RestaurantResponse> getMyFollowedRestaurants(Long memberId, Pageable pageable) {
        Page<Follow> follows = followRepository.findByMemberIdWithRestaurant(memberId, pageable);
        return follows.map(f -> RestaurantResponse.from(f.getRestaurant()));
    }

    public List<Long> getMyFollowedRestaurantIds(Long memberId) {
        return followRepository.findRestaurantIdsByMemberId(memberId);
    }

    public boolean isFollowing(Long memberId, Long restaurantId) {
        return followRepository.existsByMemberIdAndRestaurantId(memberId, restaurantId);
    }

    public Long getFollowerCount(Long restaurantId) {
        return followRepository.countByRestaurantId(restaurantId);
    }

    // ==================== 회원 팔로우 ====================

    @Transactional
    public void followMember(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다");
        }

        Member follower = memberRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        Member following = memberRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new DuplicateResourceException("이미 팔로우한 회원입니다");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        followRepository.save(follow);
        
        // 🔔 팔로우 당한 사람에게 알림 발송
        notificationService.sendNotification(
                followingId,                    // 수신자: 팔로우 당한 사람
                followerId,                     // 발신자: 팔로우 한 사람
                NotificationType.NEW_FOLLOWER,
                "새로운 팔로워가 생겼습니다",
                String.format("%s님이 회원님을 팔로우하기 시작했습니다.",
                        follower.getNickname()),
                followerId,
                "MEMBER",
                "/mypage/followers"
        );
    }

    @Transactional
    public void unfollowMember(Long followerId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResourceNotFoundException("팔로우하지 않은 회원입니다"));

        followRepository.delete(follow);
    }

    // 나의 팔로워 목록 (나를 팔로우하는 사람들)
    public Page<MemberResponse> getMyFollowers(Long memberId, Pageable pageable) {
        Page<Follow> follows = followRepository.findFollowersByMemberId(memberId, pageable);
        return follows.map(f -> MemberResponse.from(f.getFollower()));
    }

    // 나의 팔로잉 목록 (내가 팔로우하는 사람들)
    public Page<MemberResponse> getMyFollowing(Long memberId, Pageable pageable) {
        Page<Follow> follows = followRepository.findFollowingsByMemberId(memberId, pageable);
        return follows.map(f -> MemberResponse.from(f.getFollowing()));
    }

    // 팔로워 삭제 (특정 팔로워가 나를 팔로우한 것을 취소)
    @Transactional
    public void removeFollower(Long memberId, Long followerId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 팔로워를 찾을 수 없습니다"));

        followRepository.delete(follow);
    }

    // 회원 팔로우 여부 확인
    public boolean isFollowingMember(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    // ==================== 통계 ====================

    public Long getFollowingCount(Long memberId) {
        return followRepository.countFollowingByMemberId(memberId);
    }

    public Long getFollowersCount(Long memberId) {
        return followRepository.countFollowersByMemberId(memberId);
    }

    public Long getFavoriteRestaurantCount(Long memberId) {
        return followRepository.countRestaurantFollowsByMemberId(memberId);
    }
}
