package com.ezroad.controller;

import com.ezroad.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @param type 파일 타입 (restaurant, menu, review, profile, menupan)
     * @return 업로드된 파일 URL
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) throws IOException {
        
        // 파일 타입 검증
        validateFileType(type);
        
        // 파일 업로드
        String fileUrl = fileUploadService.uploadFile(file, type);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("originalName", file.getOriginalFilename());
        response.put("size", String.valueOf(file.getSize()));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 파일 삭제
     * @param fileUrl 삭제할 파일 URL
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteFile(@RequestParam("url") String fileUrl) {
        fileUploadService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }

    /**
     * 파일 타입 검증
     */
    private void validateFileType(String type) {
        if (!type.matches("restaurant|menu|review|profile|menupan")) {
            throw new IllegalArgumentException("올바르지 않은 파일 타입입니다: " + type);
        }
    }
}
