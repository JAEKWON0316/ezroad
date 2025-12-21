package com.ezroad.dto.response;

import com.ezroad.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Long referenceId;
    private String referenceType;
    private String linkUrl;
    private boolean isRead;
    private String createdAt;
    private String senderNickname;
    private String senderProfileImage;

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .linkUrl(notification.getLinkUrl())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt().toString())
                .senderNickname(notification.getSender() != null ? 
                    notification.getSender().getNickname() : null)
                .senderProfileImage(notification.getSender() != null ? 
                    notification.getSender().getProfileImage() : null)
                .build();
    }
}
