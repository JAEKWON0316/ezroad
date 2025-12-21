package com.ezroad.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 구독할 prefix
        // /topic - 브로드캐스트 (1:N)
        // /queue - 개인 메시지 (1:1)
        config.enableSimpleBroker("/topic", "/queue");
        
        // 클라이언트가 메시지를 보낼 때 사용하는 prefix
        config.setApplicationDestinationPrefixes("/app");
        
        // 특정 사용자에게 메시지를 보낼 때 사용하는 prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 연결 엔드포인트
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000",
                    "https://linkisy.kr",
                    "https://www.linkisy.kr",
                    "https://ezroad.vercel.app"
                )
                .withSockJS(); // SockJS fallback 지원
    }
}
