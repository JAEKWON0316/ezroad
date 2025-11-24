package com.ezroad.service;

import com.ezroad.dto.request.RestaurantCreateRequest;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.entity.Member;
import com.ezroad.entity.Restaurant;
import com.ezroad.entity.RestaurantStatus;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.MemberRepository;
import com.ezroad.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Page<RestaurantResponse> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findByStatus(RestaurantStatus.ACTIVE, pageable)
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
}
