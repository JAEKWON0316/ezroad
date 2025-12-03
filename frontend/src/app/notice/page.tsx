export default function NoticePage() {
  const notices = [
    {
      id: 1,
      title: 'EzenRoad 서비스 오픈 안내',
      date: '2024-12-04',
      content: 'EzenRoad 서비스가 정식 오픈되었습니다. 많은 이용 부탁드립니다.',
    },
    {
      id: 2,
      title: '서비스 이용 안내',
      date: '2024-12-04',
      content: '식당 검색, 예약, 리뷰 기능을 이용하실 수 있습니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">공지사항</h1>
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{notice.title}</h3>
                <span className="text-sm text-gray-500">{notice.date}</span>
              </div>
              <p className="text-gray-600">{notice.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
