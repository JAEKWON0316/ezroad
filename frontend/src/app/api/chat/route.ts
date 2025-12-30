import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chatTools } from '@/lib/chatbot/tools';
import { buildSystemPrompt, SYSTEM_PROMPT } from '@/lib/chatbot/openai';
import { handleRecommendRestaurant } from '@/lib/chatbot/handlers/restaurantHandler';
import { handleRecommendCourse } from '@/lib/chatbot/handlers/courseHandler';
import { handleGetReservationStatus } from '@/lib/chatbot/handlers/reservationHandler';
import { handleGetWaitingStatus } from '@/lib/chatbot/handlers/waitingHandler';
import { handleNavigateToReservation } from '@/lib/chatbot/handlers/navigationHandler';
import { ChatMessage, RestaurantRecommendation } from '@/types/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, token, lastRecommendedRestaurants } = body as {
      messages: ChatMessage[];
      token?: string;
      lastRecommendedRestaurants?: RestaurantRecommendation[];
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // 동적으로 시스템 프롬프트 생성 (DB에서 가게 목록 가져옴)
    let systemPrompt: string;
    try {
      systemPrompt = await buildSystemPrompt();
    } catch (error) {
      console.error('Failed to build dynamic prompt, using fallback:', error);
      systemPrompt = SYSTEM_PROMPT; // fallback
    }

    // OpenAI 메시지 형식으로 변환
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // GPT-4o-mini 호출 (Function Calling)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      tools: chatTools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices[0].message;

    // Tool 호출이 있는 경우 처리
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      // 타입 가드: function 타입인지 확인
      if ('function' in toolCall) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let result;

        switch (functionName) {
          case 'recommend_restaurant':
            result = await handleRecommendRestaurant(functionArgs);
            return NextResponse.json({
              message: result.message,
              data: {
                type: 'restaurants',
                restaurants: result.restaurants,
                actions: result.actions,
              },
            });

          case 'recommend_course':
            result = await handleRecommendCourse(functionArgs);
            return NextResponse.json({
              message: result.message,
              data: {
                type: 'course',
                course: result.course,
                actions: result.actions,
              },
            });

          case 'get_reservation_status':
            result = await handleGetReservationStatus(token, functionArgs.include_past);
            return NextResponse.json({
              message: result.message,
              data: {
                type: 'reservation',
                reservations: result.reservations,
                actions: result.actions,
              },
            });

          case 'get_waiting_status':
            result = await handleGetWaitingStatus(token);
            return NextResponse.json({
              message: result.message,
              data: {
                type: 'waiting',
                waitings: result.waitings,
                actions: result.actions,
              },
            });

          case 'navigate_to_reservation':
            result = await handleNavigateToReservation(functionArgs, lastRecommendedRestaurants);
            return NextResponse.json({
              message: result.message,
              data: {
                type: 'action',
                actions: result.actions,
              },
            });

          default:
            // 알 수 없는 함수인 경우 일반 응답
            break;
        }
      }
    }

    // 일반 텍스트 응답
    return NextResponse.json({
      message: assistantMessage.content || '죄송해요, 응답을 생성하지 못했어요.',
      data: { type: 'text' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: '죄송해요, 오류가 발생했어요. 잠시 후 다시 시도해주세요! 😅'
      },
      { status: 500 }
    );
  }
}
