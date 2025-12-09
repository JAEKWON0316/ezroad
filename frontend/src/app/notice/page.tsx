'use client';

import { useState } from 'react';
import { ChevronRight, Megaphone, Calendar } from 'lucide-react';
import Scene3D from '@/components/home/Scene3D';

export default function NoticePage() {
  const notices = [
    {
      id: 1,
      title: 'Linkisy 서비스 정식 오픈 안내',
      date: '2024-12-04',
      category: '공지',
      content: `안녕하세요, Linkisy 팀입니다.\n\n오랜 준비 끝에 드디어 Linkisy 서비스가 정식으로 오픈되었습니다.\nLinkisy는 단순한 맛집 검색을 넘어, 예약부터 웨이팅, 그리고 나만의 미식 경험을 기록하는 종합 다이닝 플랫폼을 지향합니다.\n\n[주요 기능]\n- 실시간 예약 및 웨이팅\n- 3D 지도 기반 맛집 탐색\n- 나만의 맛집 리스트 공유\n\n앞으로도 더 나은 서비스를 위해 최선을 다하겠습니다.\n감사합니다.`,
    },
    {
      id: 2,
      title: '신규 파트너스 혜택 안내',
      date: '2024-12-05',
      category: '이벤트',
      content: '신규 입점하시는 파트너 사장님들을 위한 특별한 혜택을 준비했습니다.\n\n1. 3개월 중개 수수료 0원\n2. 프리미엄 노출 패키지 1개월 체험권\n3. 전문 포토그래퍼의 메뉴 사진 촬영 지원\n\n지금 바로 파트너 센터에서 신청하세요!',
    },
    {
      id: 3,
      title: '시스템 점검 안내 (12/10 02:00 ~ 04:00)',
      date: '2024-12-08',
      category: '점검',
      content: '보다 안정적인 서비스 제공을 위해 정기 시스템 점검이 진행될 예정입니다.\n\n- 일시: 12월 10일(화) 새벽 2시 ~ 4시 (2시간)\n- 작업 내용: 서버 안정화 및 보안 업데이트\n\n점검 시간 동안 서비스 이용이 일시적으로 제한될 수 있습니다.\n이용에 불편을 드려 죄송합니다.',
    },
  ];

  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-300/20 to-transparent rounded-full blur-3xl opacity-60 transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/20 to-transparent rounded-full blur-3xl opacity-60 transform -translate-x-1/3 translate-y-1/4" />
      </div>

      <div className="relative pt-24 pb-12 px-4 text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tracking-wider mb-4 animate-fade-in-up">
            NOTICE
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            새로운 소식을<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">알려드립니다</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Linkisy의 업데이트, 이벤트 등 다양한 정보를 확인해보세요.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`glass-card p-0 rounded-2xl overflow-hidden transition-all duration-300 ${expandedId === notice.id ? 'shadow-lg ring-1 ring-orange-200' : 'hover:shadow-md'}`}
          >
            <button
              onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
              className="w-full text-left p-6 flex items-start gap-4 transition-colors hover:bg-white/40"
            >
              <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notice.category === '공지' ? 'bg-blue-50 text-blue-600' :
                  notice.category === '이벤트' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500'
                }`}>
                <Megaphone className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${notice.category === '공지' ? 'bg-blue-100 text-blue-700' :
                      notice.category === '이벤트' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {notice.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {notice.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug break-keep group-hover:text-orange-600 transition-colors">
                  {notice.title}
                </h3>
              </div>

              <div className={`transform transition-transform duration-300 text-gray-400 ${expandedId === notice.id ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === notice.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 pt-0 text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-100/50 bg-gray-50/30">
                {notice.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
