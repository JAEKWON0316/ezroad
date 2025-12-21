package com.ezroad.config;

import com.ezroad.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Collections;

@Slf4j
@Configuration
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        
                        try {
                            if (jwtTokenProvider.validateToken(token)) {
                                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                                String role = jwtTokenProvider.getRoleFromToken(token);
                                
                                UsernamePasswordAuthenticationToken auth = 
                                    new UsernamePasswordAuthenticationToken(
                                        userId,
                                        null,
                                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                                    );
                                
                                accessor.setUser(auth);
                                log.info("WebSocket 인증 성공 - userId: {}", userId);
                            }
                        } catch (Exception e) {
                            log.error("WebSocket 인증 실패: {}", e.getMessage());
                        }
                    }
                }
                
                return message;
            }
        });
    }
}
