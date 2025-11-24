package com.ezroad.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "waiting")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Waiting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "waiting_number", nullable = false)
    private Integer waitingNumber;

    @Column(name = "guest_count")
    private Integer guestCount = 1;

    @Column(name = "estimated_wait_time")
    private Integer estimatedWaitTime;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private WaitingStatus status = WaitingStatus.WAITING;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Builder
    public Waiting(Restaurant restaurant, Member member, Integer waitingNumber, 
                   Integer guestCount, Integer estimatedWaitTime, WaitingStatus status) {
        this.restaurant = restaurant;
        this.member = member;
        this.waitingNumber = waitingNumber;
        this.guestCount = guestCount != null ? guestCount : 1;
        this.estimatedWaitTime = estimatedWaitTime;
        this.status = status != null ? status : WaitingStatus.WAITING;
    }

    // 비즈니스 로직
    public void call() {
        this.status = WaitingStatus.CALLED;
        this.calledAt = LocalDateTime.now();
    }

    public void seat() {
        this.status = WaitingStatus.SEATED;
    }

    public void cancel() {
        this.status = WaitingStatus.CANCELLED;
    }

    public void noShow() {
        this.status = WaitingStatus.NO_SHOW;
    }
}
