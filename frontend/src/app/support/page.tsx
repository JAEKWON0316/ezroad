'use client';

import Link from 'next/link';
import { HelpCircle, MessageCircle, FileText, ChevronRight } from 'lucide-react';

export default function SupportPage() {
    const supports = [
        {
            title: '공지사항',
            description: '서비스의 새로운 소식과 업데이트를 확인하세요.',
            icon: <MessageCircle className="w-8 h-8 text-orange-500" />,
            href: '/notice',
            color: 'bg-orange-50 text-orange-600',
        },
        {
            title: '자주 묻는 질문 (FAQ)',
            description: '이용 중 궁금한 점을 빠르게 해결해 드립니다.',
            icon: <HelpCircle className="w-8 h-8 text-blue-500" />,
            href: '/faq',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            title: '1:1 문의',
            description: '해결되지 않은 문제는 직접 문의해 주세요.',
            icon: <FileText className="w-8 h-8 text-green-500" />,
            href: '/contact',
            color: 'bg-green-50 text-green-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">고객지원 센터</h1>
                    <p className="text-gray-500">
                        무엇을 도와드릴까요? 궁금한 점이나 불편한 사항을 해결해 드립니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {supports.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                {item.description}
                            </p>
                            <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-orange-500 transition-colors">
                                바로가기 <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">원하시는 답변을 찾지 못하셨나요?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        고객센터 운영시간: 평일 09:00 ~ 18:00 (주말/공휴일 휴무)
                    </p>
                    <a
                        href="tel:1588-0000"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                        전화 상담하기
                    </a>
                </div>
            </div>
        </div>
    );
}
