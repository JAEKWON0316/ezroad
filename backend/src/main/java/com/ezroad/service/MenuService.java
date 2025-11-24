package com.ezroad.service;

import com.ezroad.dto.request.MenuCreateRequest;
import com.ezroad.dto.response.MenuResponse;
import com.ezroad.entity.Menu;
import com.ezroad.entity.Restaurant;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.repository.MenuRepository;
import com.ezroad.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public MenuResponse createMenu(MenuCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        Menu menu = Menu.builder()
                .restaurant(restaurant)
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .build();

        Menu saved = menuRepository.save(menu);
        return MenuResponse.from(saved);
    }

    public List<MenuResponse> getMenusByRestaurant(Long restaurantId) {
        return menuRepository.findByRestaurantIdAndIsVisibleTrue(restaurantId)
                .stream()
                .map(MenuResponse::from)
                .toList();
    }

    public MenuResponse getMenuById(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 메뉴입니다"));
        return MenuResponse.from(menu);
    }
}
