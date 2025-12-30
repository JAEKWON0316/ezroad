'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChatMessage, ChatMessageData, RestaurantRecommendation } from '@/types/chat';
import { useAuth } from '@/context/AuthContext';

interface ChatContextType {
    messages: ChatMessage[];
    isLoading: boolean;
    isChatOpen: boolean;
    sendMessage: (content: string) => Promise<void>;
    toggleChat: (open?: boolean) => void;
    clearHistory: () => void;
    lastRecommendedRestaurants: RestaurantRecommendation[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'linkybot_history';

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user, accessToken } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [lastRecommendedRestaurants, setLastRecommendedRestaurants] = useState<RestaurantRecommendation[]>([]);

    // Track previous user to detect logout
    const [prevUser, setPrevUser] = useState<any>(user);

    const toggleChat = useCallback((open?: boolean) => {
        setIsChatOpen(prev => open ?? !prev);
    }, []);

    const clearHistory = useCallback(() => {
        const defaultMsg = [
            {
                id: Date.now().toString(),
                role: 'assistant' as const,
                content: `미식 파트ner LinkyBot이 다시 찾아왔습니다! ✨\n새로운 미식 탐험을 시작해 볼까요? 🥂`,
                timestamp: new Date(),
            },
        ];
        setMessages(defaultMsg);
        setLastRecommendedRestaurants([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // 1. Initial Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const reconstructed = parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(reconstructed);
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        } else {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: `안녕하세요! ✨ Linkisy의 미식 컨시어지, **LinkyBot**입니다. 🥂\n\n오늘 어떤 특별한 미식 여정을 도와드릴까요? 🥑`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, []);

    // 2. Save to localStorage on change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    // 3. Clear history on Logout
    useEffect(() => {
        if (prevUser && !user) {
            // User was logged in but now is not (Logout)
            clearHistory();
        }
        setPrevUser(user);
    }, [user, prevUser, clearHistory]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    token: accessToken,
                    lastRecommendedRestaurants,
                }),
            });

            const data = await response.json();

            if (data.data?.restaurants) {
                setLastRecommendedRestaurants(data.data.restaurants);
            }
            if (data.data?.course?.spots) {
                setLastRecommendedRestaurants(
                    data.data.course.spots.map((s: { restaurant: RestaurantRecommendation }) => s.restaurant)
                );
            }

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message || '죄송해요, 응답을 생성하지 못했어요.',
                timestamp: new Date(),
                data: data.data as ChatMessageData,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '죄송해요, 오류가 발생했어요. 잠시 후 다시 시도해주세요! 😅',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                isLoading,
                isChatOpen,
                sendMessage,
                toggleChat,
                clearHistory,
                lastRecommendedRestaurants
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
