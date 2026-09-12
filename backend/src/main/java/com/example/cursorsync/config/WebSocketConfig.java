package com.example.cursorsync.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Wires up STOMP-over-WebSocket (with a SockJS fallback for environments
 * that block raw WebSocket connections).
 *
 * Clients connect to /ws, then:
 *  - SEND cursor updates to      /app/cursor/{room}
 *  - SUBSCRIBE for updates on    /topic/cursor/{room}
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Set this to your deployed frontend URL when you go live, e.g.
    // https://your-app.vercel.app. "*" is fine for local dev only.
    @Value("${app.allowed-origin:*}")
    private String allowedOrigin;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigin)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Messages published here are fanned out to every subscriber.
        registry.enableSimpleBroker("/topic");
        // Messages a client sends are routed to @MessageMapping methods
        // under this prefix.
        registry.setApplicationDestinationPrefixes("/app");
    }
}
