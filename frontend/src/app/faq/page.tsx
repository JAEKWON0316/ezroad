'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle, Search } from 'lucide-react';
import Scene3D from '@/components/home/Scene3D';

export default function FaqPage() {
  const faqs = [
    {
      category: '회원',
      question: '회원가입은 어떻게 하나요?',
      answer: '홈페이지 우측 상단의 "로그인/회원가입" 버튼을 클릭하신 후, 이메일 주소와 간단한 정보를 입력하시면 누구나 무료로 가입하실 수 있습니다.\n카카오톡, 구글 등 소셜 계정을 통한 간편 가입도 지원합니다.',
    },
    {
      category: '예약',
      question: '예약 후 변경이나 취소가 가능한가요?',
      answer: '네, 가능합니다. [마이페이지 > 예약 내역]에서 예약 상태를 확인하고 변경 또는 취소하실 수 있습니다.\n단, 식당의 예약 정책에 따라 방문 임박 시 취소 수수료가 발생하거나 취소가 불가능할 수 있으니 유의해주세요.',
    },
    {
      category: '예약',
      question: '노쇼(No-Show) 페널티가 있나요?',
      answer: '건전한 예약 문화를 위해 상습적인 노쇼 회원의 경우 서비스 이용이 일시적으로 제한될 수 있습니다.\n부득이한 사정으로 방문이 어려우신 경우, 반드시 사전에 예약을 취소해주시기 바랍니다.',
    },
    {
      category: '파트너',
      question: '사업자 등록은 어떻게 하나요?',
      answer: '회원가입 후 [파트너 센터 > 입점 신청] 메뉴를 통해 사업자등록증 사본을 업로드해주시면 됩니다.\n담당자 검토 후(통상 1~3 영업일 소요) 승인이 완료되면 바로 파트너 서비스를 이용하실 수 있습니다.',
    },
    {
      category: '서비스',
      question: '리뷰 작성 포인트는 언제 적립되나요?',
      answer: '예약 방문 또는 웨이팅 이용 완료 후 3일 이내에 리뷰를 작성하시면 포인트가 즉시 적립됩니다.\n포토 리뷰 작성 시 추가 포인트 혜택을 드리고 있습니다.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.includes(searchTerm) ||
      faq.answer.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/20 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-300/20 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative pt-24 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold tracking-wider mb-4 animate-fade-in-up">
            FAQ
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            무엇을<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">도와드릴까요?</span>
          </h1>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <input
              type="text"
              placeholder="질문 키워드를 입력해보세요 (예: 예약, 취소)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/80 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg shadow-blue-500/5 transition-all text-gray-700 placeholder-gray-400"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className={`glass-card p-0 rounded-2xl transition-all duration-300 ${openIndex === index ? 'ring-1 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex items-start gap-4"
              >
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${openIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                  Q
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <span className="block text-xs font-bold text-blue-600 mb-1">{faq.category}</span>
                  <h3 className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-blue-900' : 'text-gray-900'}`}>
                    {faq.question}
                  </h3>
                </div>
                <div className="pt-1 text-gray-400">
                  {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pl-[4.5rem] text-gray-600 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
