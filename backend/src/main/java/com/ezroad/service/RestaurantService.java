package com.ezroad.service;

import com.ezroad.dto.request.RestaurantCreateRequest;
import com.ezroad.dto.request.RestaurantUpdateRequest;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Restaurant;
import com.ezroad.entity.RestaurantStatus;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public RestaurantResponse createRestaurant(Long ownerId, RestaurantCreateRequest request) {
        Member owner = memberRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        Restaurant restaurant = Restaurant.builder()
                .owner(owner)
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .phone(request.getPhone())
                .zipcode(request.getZipcode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .website(request.getWebsite())
                .businessHours(request.getBusinessHours())
                .notice(request.getNotice())
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantResponse.from(saved);
    }

    public Page<RestaurantResponse> getAllRestaurants(String keyword, String category, Pageable pageable) {
        // keyword나 category가 빈 문자열이면 null로 처리
        String searchKeyword = (keyword != null && !keyword.isEmpty()) ? keyword : null;
        String searchCategory = (category != null && !category.isEmpty()) ? category : null;
        
        return restaurantRepository.searchRestaurants(
                RestaurantStatus.ACTIVE, searchCategory, searchKeyword, pageable)
                .map(RestaurantResponse::from);
    }

    public Page<RestaurantResponse> searchRestaurants(String keyword, Pageable pageable) {
        return restaurantRepository.findByStatusAndNameContaining(RestaurantStatus.ACTIVE, keyword, pageable)
                .map(RestaurantResponse::from);
    }

    @Transactional
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        restaurant.incrementViewCount();
        return RestaurantResponse.from(restaurant);
    }

    public List<RestaurantResponse> getMyRestaurants(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(RestaurantResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestaurantResponse updateRestaurant(Long ownerId, Long restaurantId, RestaurantUpdateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("수정 권한이 없습니다");
        }

        if (request.getName() != null) restaurant.updateName(request.getName());
        if (request.getCategory() != null) restaurant.updateCategory(request.getCategory());
        if (request.getDescription() != null) restaurant.updateDescription(request.getDescription());
        if (request.getPhone() != null) restaurant.updatePhone(request.getPhone());
        if (request.getAddress() != null) restaurant.updateAddress(request.getZipcode(), request.getAddress(), request.getAddressDetail());
        if (request.getLatitude() != null && request.getLongitude() != null) {
            restaurant.updateLocation(request.getLatitude(), request.getLongitude());
        }
        if (request.getWebsite() != null) restaurant.updateWebsite(request.getWebsite());
        if (request.getBusinessHours() != null) restaurant.updateBusinessHours(request.getBusinessHours());
        if (request.getNotice() != null) restaurant.updateNotice(request.getNotice());
        if (request.getThumbnail() != null) restaurant.updateThumbnail(request.getThumbnail());
        if (request.getMenuBoardImage() != null) restaurant.updateMenuBoardImage(request.getMenuBoardImage());

        return RestaurantResponse.from(restaurant);
    }

    @Transactional
    public RestaurantResponse updateNotice(Long ownerId, Long restaurantId, String notice) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("수정 권한이 없습니다");
        }

        restaurant.updateNotice(notice);
        return RestaurantResponse.from(restaurant);
    }

    @Transactional
    public void deleteRestaurant(Long ownerId, Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));
        
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("삭제 권한이 없습니다");
        }

        restaurant.updateStatus(RestaurantStatus.DELETED);
    }
}
