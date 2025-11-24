package com.ezroad.controller;

import com.ezroad.dto.request.MenuCreateRequest;
import com.ezroad.dto.response.MenuResponse;
import com.ezroad.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    public ResponseEntity<MenuResponse> createMenu(@Valid @RequestBody MenuCreateRequest request) {
        return ResponseEntity.ok(menuService.createMenu(request));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuResponse>> getMenusByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuService.getMenusByRestaurant(restaurantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuResponse> getMenuById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuById(id));
    }
}
