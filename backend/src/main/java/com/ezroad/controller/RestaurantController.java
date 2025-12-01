package com.ezroad.controller;

import com.ezroad.dto.request.RestaurantCreateRequest;
import com.ezroad.dto.request.RestaurantUpdateRequest;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "avgRating") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
        
        // 유효한 정렬 필드 검증
        String sortField = switch (sort) {
            case "reviewCount" -> "reviewCount";
            case "createdAt" -> "createdAt";
            case "viewCount" -> "viewCount";
            default -> "avgRating";
        };
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortField));
        return ResponseEntity.ok(restaurantService.getAllRestaurants(keyword, category, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<RestaurantResponse>> searchRestaurants(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(keyword, pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            @AuthenticationPrincipal Long ownerId) {
        return ResponseEntity.ok(restaurantService.getMyRestaurants(ownerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @AuthenticationPrincipal Long ownerId,
            @PathVariable Long id,
            @Valid @RequestBody RestaurantUpdateRequest request) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(ownerId, id, request));
    }

    @PatchMapping("/{id}/notice")
    public ResponseEntity<RestaurantResponse> updateNotice(
            @AuthenticationPrincipal Long ownerId,
            @PathVariable Long id,
            @RequestBody NoticeUpdateRequest request) {
        return ResponseEntity.ok(restaurantService.updateNotice(ownerId, id, request.notice()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(
            @AuthenticationPrincipal Long ownerId,
            @PathVariable Long id) {
        restaurantService.deleteRestaurant(ownerId, id);
        return ResponseEntity.noContent().build();
    }

    public record NoticeUpdateRequest(String notice) {}
}
