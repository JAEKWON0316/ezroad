export default function BusinessTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">사업자 이용약관</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
            <p className="text-gray-600">
              이 약관은 Linkisy 플랫폼에서 사업자 회원이 서비스를 이용함에 있어
              필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">제2조 (사업자 등록)</h2>
            <p className="text-gray-600">
              사업자 회원은 유효한 사업자등록번호를 보유해야 하며,
              허위 정보 기재 시 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">제3조 (서비스 내용)</h2>
            <p className="text-gray-600">
              사업자 회원은 식당 정보 등록, 메뉴 관리, 예약 관리, 리뷰 관리 등의
              서비스를 이용할 수 있습니다.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">제4조 (책임과 의무)</h2>
            <p className="text-gray-600">
              사업자 회원은 등록한 정보의 정확성을 보장해야 하며,
              고객 예약에 대해 성실히 이행해야 합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
