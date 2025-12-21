package com.ezroad.entity;

public enum NotificationType {
    // 예약 관련 (DB 저장)
    RESERVATION_NEW,        // 새 예약 (사업자에게)
    RESERVATION_CONFIRMED,  // 예약 확정 (고객에게)
    RESERVATION_CANCELLED,  // 예약 취소
    RESERVATION_COMPLETED,  // 방문 완료 + 리뷰 요청
    
    // 대기 관련 (DB 저장)
    WAITING_NEW,            // 새 대기 (사업자에게)
    WAITING_CALLED,         // 호출 (고객에게)
    WAITING_CANCELLED,      // 대기 취소
    
    // 대기열 실시간 (휘발성 - DB 저장 안함)
    WAITING_QUEUE_UPDATE,   // 순번 변경
    WAITING_COUNT_UPDATE,   // 대기 인원 변경
    
    // 팔로우/리뷰 관련 (DB 저장)
    NEW_FOLLOWER,           // 새 팔로워
    NEW_REVIEW              // 새 리뷰 (사업자에게)
}
