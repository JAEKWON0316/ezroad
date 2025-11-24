package com.ezroad.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.cloudfront-domain}")
    private String cloudfrontDomain;

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @param folder S3 폴더 경로 (restaurants, menus, reviews, profiles 등)
     * @return CloudFront URL
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String s3Key = generateS3Key(folder, extension);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded successfully: {}", s3Key);
            return cloudfrontDomain + "/" + s3Key;

        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", e.getMessage());
            throw new RuntimeException("파일 업로드에 실패했습니다", e);
        }
    }

    /**
     * 파일 삭제
     * @param fileUrl CloudFront URL
     */
    public void deleteFile(String fileUrl) {
        try {
            String s3Key = extractS3KeyFromUrl(fileUrl);
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully: {}", s3Key);

        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", e.getMessage());
        }
    }

    /**
     * S3 키 생성 (UUID 기반)
     */
    private String generateS3Key(String folder, String extension) {
        String uuid = UUID.randomUUID().toString();
        return folder + "/" + uuid + extension;
    }

    /**
     * 파일 확장자 추출
     */
    private String getExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex);
    }

    /**
     * CloudFront URL에서 S3 키 추출
     */
    private String extractS3KeyFromUrl(String fileUrl) {
        if (fileUrl.startsWith(cloudfrontDomain)) {
            return fileUrl.substring(cloudfrontDomain.length() + 1);
        }
        return fileUrl;
    }
}
