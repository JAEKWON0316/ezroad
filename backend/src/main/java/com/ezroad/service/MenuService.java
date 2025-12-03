package com.ezroad.service;

import com.ezroad.dto.request.MenuCreateRequest;
import com.ezroad.dto.response.MenuResponse;
import com.ezroad.entity.Menu;
import com.ezroad.entity.Restaurant;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
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
    public MenuResponse createMenu(Long memberId, MenuCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 식당입니다"));

        // 권한 체크
        if (!restaurant.getOwner().getId().equals(memberId)) {
            throw new UnauthorizedException("메뉴 등록 권한이 없습니다");
        }

        Menu menu = Menu.builder()
                .restaurant(restaurant)
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .thumbnail(request.getThumbnail())
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

    @Transactional
    public MenuResponse updateMenu(Long memberId, Long menuId, MenuCreateRequest request) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 메뉴입니다"));

        // 권한 체크
        if (!menu.getRestaurant().getOwner().getId().equals(memberId)) {
            throw new UnauthorizedException("메뉴 수정 권한이 없습니다");
        }

        menu.update(request.getName(), request.getPrice(), request.getDescription(), request.getThumbnail());
        return MenuResponse.from(menu);
    }

    @Transactional
    public MenuResponse toggleVisibility(Long memberId, Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 메뉴입니다"));

        // 권한 체크
        if (!menu.getRestaurant().getOwner().getId().equals(memberId)) {
            throw new UnauthorizedException("메뉴 수정 권한이 없습니다");
        }

        menu.toggleVisibility();
        return MenuResponse.from(menu);
    }

    @Transactional
    public void deleteMenu(Long memberId, Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 메뉴입니다"));

        // 권한 체크
        if (!menu.getRestaurant().getOwner().getId().equals(memberId)) {
            throw new UnauthorizedException("메뉴 삭제 권한이 없습니다");
        }

        menuRepository.delete(menu);
    }
}
