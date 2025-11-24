package com.ezroad.controller;

import com.ezroad.dto.request.RestaurantCreateRequest;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @AuthenticationPrincipal Long ownerId,
            @Valid @RequestBody RestaurantCreateRequest request) {
        return ResponseEntity.ok(restaurantService.createRestaurant(ownerId, request));
    }

    @GetMapping
    public ResponseEntity<Page<RestaurantResponse>> getAllRestaurants(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(restaurantService.getAllRestaurants(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<RestaurantResponse>> searchRestaurants(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }
}
