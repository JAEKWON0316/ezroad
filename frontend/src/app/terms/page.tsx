export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">이용약관</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
            <p className="text-gray-600">
              이 약관은 Linkisy(이하 &quot;서비스&quot;)의 이용조건 및 절차,
              회원과 서비스 제공자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">제2조 (서비스의 제공)</h2>
            <p className="text-gray-600">
              서비스는 식당 검색, 예약, 리뷰 작성 등의 기능을 제공합니다.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">제3조 (회원가입)</h2>
            <p className="text-gray-600">
              회원가입은 이용약관에 동의한 후 회원정보를 기입하여 가입신청을 합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
