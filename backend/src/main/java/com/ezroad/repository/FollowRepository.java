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
    
    // 식당 팔로우 관련
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant.id = :restaurantId")
    Optional<Follow> findByMemberIdAndRestaurantId(@Param("memberId") Long memberId, @Param("restaurantId") Long restaurantId);
    
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant.id = :restaurantId")
    boolean existsByMemberIdAndRestaurantId(@Param("memberId") Long memberId, @Param("restaurantId") Long restaurantId);
    
    @Query("SELECT f.restaurant.id FROM Follow f WHERE f.follower.id = :memberId AND f.restaurant IS NOT NULL")
    List<Long> findRestaurantIdsByMemberId(@Param("memberId") Long memberId);
    
    @Query("SELECT f FROM Follow f JOIN FETCH f.restaurant WHERE f.follower.id = :memberId AND f.restaurant IS NOT NULL")
    Page<Follow> findByMemberIdWithRestaurant(@Param("memberId") Long memberId, Pageable pageable);
    
    Long countByRestaurantId(Long restaurantId);
    
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :memberId")
    List<Follow> findByMemberId(@Param("memberId") Long memberId);
    
    List<Follow> findByRestaurantId(Long restaurantId);
    
    // 회원-회원 팔로우 통계
    Long countByFollowerIdAndFollowingIsNotNull(Long followerId);
    Long countByFollowingIdAndFollowerIsNotNull(Long followingId);
}
