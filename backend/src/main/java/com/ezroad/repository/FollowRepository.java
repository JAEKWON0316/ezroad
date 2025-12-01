package com.ezroad.repository;

import com.ezroad.entity.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // ==================== 식당 팔로우 관련 ====================
    
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant.id = :restaurantId")
    Optional<Follow> findByMemberIdAndRestaurantId(@Param("memberId") Long memberId, @Param("restaurantId") Long restaurantId);
    
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant.id = :restaurantId")
    boolean existsByMemberIdAndRestaurantId(@Param("memberId") Long memberId, @Param("restaurantId") Long restaurantId);
    
    @Query("SELECT f.restaurant.id FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant IS NOT NULL")
    List<Long> findRestaurantIdsByMemberId(@Param("memberId") Long memberId);
    
    @Query(value = "SELECT f FROM Follow f JOIN FETCH f.restaurant WHERE f.follower.id = :memberId AND f.restaurant IS NOT NULL",
           countQuery = "SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant IS NOT NULL")
    Page<Follow> findByMemberIdWithRestaurant(@Param("memberId") Long memberId, Pageable pageable);
    
    Long countByRestaurantId(Long restaurantId);
    
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :memberId")
    List<Follow> findByMemberId(@Param("memberId") Long memberId);
    
    List<Follow> findByRestaurantId(Long restaurantId);
    
    // ==================== 회원 팔로우 관련 ====================
    
    // 회원 팔로우 존재 여부
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Follow f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    boolean existsByFollowerIdAndFollowingId(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
    
    // 회원 팔로우 찾기
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    Optional<Follow> findByFollowerIdAndFollowingId(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
    
    // 내 팔로워 목록 (나를 팔로우하는 사람들)
    @Query("SELECT f FROM Follow f JOIN FETCH f.follower WHERE f.following.id = :memberId")
    Page<Follow> findFollowersByMemberId(@Param("memberId") Long memberId, Pageable pageable);
    
    // 내 팔로잉 목록 (내가 팔로우하는 사람들)
    @Query("SELECT f FROM Follow f JOIN FETCH f.following WHERE f.follower.id = :memberId AND f.following IS NOT NULL")
    Page<Follow> findFollowingsByMemberId(@Param("memberId") Long memberId, Pageable pageable);
    
    // ==================== 통계 관련 ====================
    
    // 내가 팔로우하는 회원 수
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :memberId AND f.following IS NOT NULL")
    Long countFollowingByMemberId(@Param("memberId") Long memberId);
    
    // 나를 팔로우하는 회원 수
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.id = :memberId")
    Long countFollowersByMemberId(@Param("memberId") Long memberId);
    
    // 내가 팔로우하는 식당 수
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant IS NOT NULL")
    Long countRestaurantFollowsByMemberId(@Param("memberId") Long memberId);
}
