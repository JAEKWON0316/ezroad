package com.ezroad.repository;

import com.ezroad.entity.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
    
    List<ReviewImage> findByReviewIdOrderBySortOrderAsc(Long reviewId);
    
    void deleteByReviewId(Long reviewId);
}
