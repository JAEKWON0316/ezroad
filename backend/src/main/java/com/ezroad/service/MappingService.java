package com.ezroad.service;

import com.ezroad.dto.request.MappingCreateRequest;
import com.ezroad.dto.response.MappingResponse;
import com.ezroad.entity.Mapping;
import com.ezroad.entity.Member;
import com.ezroad.exception.ResourceNotFoundException;
import com.ezroad.exception.UnauthorizedException;
import com.ezroad.repository.MappingRepository;
import com.ezroad.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MappingService {

    private final MappingRepository mappingRepository;
    private final MemberRepository memberRepository;

    // 지도 위치 추가
    @Transactional
    public MappingResponse createMapping(Long memberId, MappingCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 회원입니다"));

        Mapping mapping = Mapping.builder()
                .member(member)
                .restaurantName(request.getRestaurantName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .build();

        Mapping savedMapping = mappingRepository.save(mapping);
        return MappingResponse.from(savedMapping);
    }

    // 내 지도 위치 목록
    public Page<MappingResponse> getMyMappings(Long memberId, Pageable pageable) {
        Page<Mapping> mappings = mappingRepository.findByMemberId(memberId, pageable);
        return mappings.map(MappingResponse::from);
    }

    // 특정 반경 내 위치 검색
    public List<MappingResponse> getNearbyMappings(BigDecimal latitude, BigDecimal longitude, 
                                                   Double radiusKm) {
        List<Mapping> mappings = mappingRepository.findAll();
        
        return mappings.stream()
                .filter(mapping -> {
                    double distance = calculateDistance(
                            latitude.doubleValue(), longitude.doubleValue(),
                            mapping.getLatitude().doubleValue(), 
                            mapping.getLongitude().doubleValue()
                    );
                    return distance <= radiusKm;
                })
                .map(MappingResponse::from)
                .collect(Collectors.toList());
    }

    // 지도 위치 삭제
    @Transactional
    public void deleteMapping(Long id, Long memberId) {
        Mapping mapping = mappingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 지도 위치입니다"));

        if (!mapping.getMember().getId().equals(memberId)) {
            throw new UnauthorizedException("삭제 권한이 없습니다");
        }

        mappingRepository.delete(mapping);
    }

    // 거리 계산 (Haversine formula)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371; // km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }
}
