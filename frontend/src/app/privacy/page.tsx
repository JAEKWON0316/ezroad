export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-600">
              EzenRoad는 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600">
              이메일, 닉네임, 전화번호(선택), 주소(선택)
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600">
              회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
