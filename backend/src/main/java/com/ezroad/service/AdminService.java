package com.ezroad.service;

import com.ezroad.dto.response.MemberResponse;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.MemberRole;
import com.ezroad.entity.Restaurant;
import com.ezroad.entity.RestaurantStatus;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final WaitingRepository waitingRepository;

    // ==================== 대시보드 통계 ====================

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 전체 통계
        stats.put("totalMembers", memberRepository.count());
        stats.put("totalRestaurants", restaurantRepository.count());
        stats.put("totalReviews", reviewRepository.count());
        stats.put("totalReservations", reservationRepository.count());
        
        // 오늘 통계
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        
        stats.put("todayMembers", memberRepository.countByCreatedAtBetween(todayStart, todayEnd));
        stats.put("todayReservations", reservationRepository.countByCreatedAtBetween(todayStart, todayEnd));
        stats.put("todayReviews", reviewRepository.countByCreatedAtBetween(todayStart, todayEnd));
        
        // 이번 주 통계
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
        stats.put("weekMembers", memberRepository.countByCreatedAtBetween(weekStart, todayEnd));
        stats.put("weekReservations", reservationRepository.countByCreatedAtBetween(weekStart, todayEnd));
        
        return stats;
    }

    // ==================== 회원 관리 ====================

    public Page<MemberResponse> getMembers(String keyword, String role, Pageable pageable) {
        Page<Member> members;
        
        if (keyword != null && !keyword.isEmpty() && role != null && !role.isEmpty()) {
            MemberRole memberRole = MemberRole.valueOf(role);
            members = memberRepository.findByNicknameContainingOrEmailContainingAndRole(keyword, keyword, memberRole, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            members = memberRepository.findByNicknameContainingOrEmailContaining(keyword, keyword, pageable);
        } else if (role != null && !role.isEmpty()) {
            MemberRole memberRole = MemberRole.valueOf(role);
            members = memberRepository.findByRole(memberRole, pageable);
        } else {
            members = memberRepository.findAll(pageable);
        }
        
        return members.map(MemberResponse::from);
    }

    public MemberResponse getMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse updateMemberRole(Long id, String role) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        MemberRole newRole = MemberRole.valueOf(role);
        member.updateRole(newRole);
        
        return MemberResponse.from(member);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));
        
        member.delete(); // Soft delete
    }

    // ==================== 식당 관리 ====================

    public Page<RestaurantResponse> getRestaurants(String keyword, String status, Pageable pageable) {
        Page<Restaurant> restaurants;
        
        if (keyword != null && !keyword.isEmpty() && status != null && !status.isEmpty()) {
            RestaurantStatus restaurantStatus = RestaurantStatus.valueOf(status);
            restaurants = restaurantRepository.findByNameContainingAndStatus(keyword, restaurantStatus, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            restaurants = restaurantRepository.findByNameContaining(keyword, pageable);
        } else if (status != null && !status.isEmpty()) {
            RestaurantStatus restaurantStatus = RestaurantStatus.valueOf(status);
            restaurants = restaurantRepository.findByStatus(restaurantStatus, pageable);
        } else {
            restaurants = restaurantRepository.findAll(pageable);
        }
        
        return restaurants.map(RestaurantResponse::from);
    }

    public RestaurantResponse getRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        return RestaurantResponse.from(restaurant);
    }

    @Transactional
    public RestaurantResponse updateRestaurantStatus(Long id, String status) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        RestaurantStatus newStatus = RestaurantStatus.valueOf(status);
        restaurant.updateStatus(newStatus);
        
        return RestaurantResponse.from(restaurant);
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        restaurant.updateStatus(RestaurantStatus.DELETED);
    }

    // ==================== 리뷰 관리 ====================

    public Page<ReviewResponse> getReviews(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return reviewRepository.findByContentContaining(keyword, pageable)
                    .map(ReviewResponse::from);
        }
        return reviewRepository.findAll(pageable).map(ReviewResponse::from);
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("존재하지 않는 리뷰입니다");
        }
        reviewRepository.deleteById(id);
    }
}
