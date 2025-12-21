package com.ezroad.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis 기반 실시간 대기열 관리 서비스
 * 
 * 데이터 구조:
 * - waiting:count:{restaurantId} → 현재 대기 인원 수 (String)
 * - waiting:queue:{restaurantId} → 대기열 Sorted Set (score=순번, value=waitingId)
 * - waiting:member:{memberId} → 회원의 현재 대기 정보 (Hash)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WaitingRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String COUNT_KEY_PREFIX = "waiting:count:";
    private static final String QUEUE_KEY_PREFIX = "waiting:queue:";
    private static final String MEMBER_KEY_PREFIX = "waiting:member:";
    private static final long CACHE_TTL_HOURS = 24; // 24시간 후 자동 만료

    /**
     * 대기 등록 시 Redis에 추가
     */
    public void addToQueue(Long restaurantId, Long waitingId, Integer waitingNumber, Long memberId) {
        String queueKey = QUEUE_KEY_PREFIX + restaurantId;
        String countKey = COUNT_KEY_PREFIX + restaurantId;
        String memberKey = MEMBER_KEY_PREFIX + memberId;
        
        try {
            // 1. Sorted Set에 대기 추가 (score = 대기번호)
            redisTemplate.opsForZSet().add(queueKey, waitingId.toString(), waitingNumber);
            
            // 2. 대기 인원 수 증가
            redisTemplate.opsForValue().increment(countKey);
            
            // 3. 회원의 현재 대기 정보 저장
            Map<String, Object> memberWaiting = new HashMap<>();
            memberWaiting.put("restaurantId", restaurantId);
            memberWaiting.put("waitingId", waitingId);
            memberWaiting.put("waitingNumber", waitingNumber);
            redisTemplate.opsForHash().putAll(memberKey, memberWaiting);
            
            // TTL 설정 (24시간)
            redisTemplate.expire(queueKey, CACHE_TTL_HOURS, TimeUnit.HOURS);
            redisTemplate.expire(countKey, CACHE_TTL_HOURS, TimeUnit.HOURS);
            redisTemplate.expire(memberKey, CACHE_TTL_HOURS, TimeUnit.HOURS);
            
            log.info("Redis 대기 추가 - 식당: {}, 대기ID: {}, 순번: {}", restaurantId, waitingId, waitingNumber);
        } catch (Exception e) {
            log.error("Redis 대기 추가 실패: {}", e.getMessage());
        }
    }

    /**
     * 대기 제거 (취소, 착석, 노쇼)
     */
    public void removeFromQueue(Long restaurantId, Long waitingId, Long memberId) {
        String queueKey = QUEUE_KEY_PREFIX + restaurantId;
        String countKey = COUNT_KEY_PREFIX + restaurantId;
        String memberKey = MEMBER_KEY_PREFIX + memberId;
        
        try {
            // 1. Sorted Set에서 제거
            Long removed = redisTemplate.opsForZSet().remove(queueKey, waitingId.toString());
            
            if (removed != null && removed > 0) {
                // 2. 대기 인원 수 감소
                redisTemplate.opsForValue().decrement(countKey);
            }
            
            // 3. 회원 대기 정보 삭제
            redisTemplate.delete(memberKey);
            
            log.info("Redis 대기 제거 - 식당: {}, 대기ID: {}", restaurantId, waitingId);
        } catch (Exception e) {
            log.error("Redis 대기 제거 실패: {}", e.getMessage());
        }
    }

    /**
     * 현재 대기 인원 수 조회
     */
    public int getWaitingCount(Long restaurantId) {
        String countKey = COUNT_KEY_PREFIX + restaurantId;
        try {
            Object count = redisTemplate.opsForValue().get(countKey);
            if (count != null) {
                return Integer.parseInt(count.toString());
            }
        } catch (Exception e) {
            log.error("Redis 대기 수 조회 실패: {}", e.getMessage());
        }
        return 0;
    }

    /**
     * 특정 대기의 앞 순번 계산 (내 앞에 몇 팀?)
     */
    public int getPositionInQueue(Long restaurantId, Long waitingId) {
        String queueKey = QUEUE_KEY_PREFIX + restaurantId;
        try {
            Long rank = redisTemplate.opsForZSet().rank(queueKey, waitingId.toString());
            if (rank != null) {
                return rank.intValue(); // 0부터 시작 (0이면 맨 앞)
            }
        } catch (Exception e) {
            log.error("Redis 순번 조회 실패: {}", e.getMessage());
        }
        return -1; // 대기열에 없음
    }

    /**
     * 회원의 현재 대기 정보 조회
     */
    public Map<Object, Object> getMemberWaitingInfo(Long memberId) {
        String memberKey = MEMBER_KEY_PREFIX + memberId;
        try {
            return redisTemplate.opsForHash().entries(memberKey);
        } catch (Exception e) {
            log.error("Redis 회원 대기 정보 조회 실패: {}", e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * 대기열 전체 조회 (Sorted Set)
     */
    public Set<Object> getQueueAll(Long restaurantId) {
        String queueKey = QUEUE_KEY_PREFIX + restaurantId;
        try {
            return redisTemplate.opsForZSet().range(queueKey, 0, -1);
        } catch (Exception e) {
            log.error("Redis 대기열 조회 실패: {}", e.getMessage());
        }
        return Set.of();
    }

    /**
     * 대기 수 직접 설정 (DB 동기화용)
     */
    public void setWaitingCount(Long restaurantId, int count) {
        String countKey = COUNT_KEY_PREFIX + restaurantId;
        try {
            redisTemplate.opsForValue().set(countKey, count);
            redisTemplate.expire(countKey, CACHE_TTL_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
            log.error("Redis 대기 수 설정 실패: {}", e.getMessage());
        }
    }

    /**
     * 식당 대기열 초기화 (자정 리셋용)
     */
    public void clearQueue(Long restaurantId) {
        String queueKey = QUEUE_KEY_PREFIX + restaurantId;
        String countKey = COUNT_KEY_PREFIX + restaurantId;
        try {
            redisTemplate.delete(queueKey);
            redisTemplate.delete(countKey);
            log.info("Redis 대기열 초기화 - 식당: {}", restaurantId);
        } catch (Exception e) {
            log.error("Redis 대기열 초기화 실패: {}", e.getMessage());
        }
    }
}
