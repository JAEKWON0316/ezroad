export default function FaqPage() {
  const faqs = [
    {
      question: '회원가입은 어떻게 하나요?',
      answer: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 이메일과 기본 정보를 입력하시면 됩니다.',
    },
    {
      question: '예약은 어떻게 하나요?',
      answer: '원하시는 식당 페이지에서 "예약하기" 버튼을 클릭하고, 날짜/시간/인원을 선택하시면 됩니다.',
    },
    {
      question: '예약 취소는 어떻게 하나요?',
      answer: '마이페이지 > 예약 내역에서 취소하실 수 있습니다.',
    },
    {
      question: '사업자 등록은 어떻게 하나요?',
      answer: '회원가입 시 사업자 번호를 입력하시면 자동으로 사업자 회원으로 등록됩니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">자주 묻는 질문</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Q. {faq.question}</h3>
              <p className="text-gray-600">A. {faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
