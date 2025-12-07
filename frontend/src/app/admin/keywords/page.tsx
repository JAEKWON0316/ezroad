'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, TrendingUp } from 'lucide-react';
import { adminApi, SearchKeyword } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminKeywordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<SearchKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchKeywords();
  }, [user]);

  const fetchKeywords = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getKeywords();
      setKeywords(data);
    } catch (error) {
      toast.error('키워드 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, keyword: string) => {
    if (!confirm(`"${keyword}" 키워드를 삭제하시겠습니까?`)) return;
    
    try {
      await adminApi.deleteKeyword(id);
      toast.success('키워드가 삭제되었습니다');
      setKeywords(keywords.filter(k => k.id !== id));
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const filteredKeywords = keywords.filter(k => 
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">검색 키워드 관리</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingUp className="h-5 w-5" />
            <span>총 {keywords.length}개</span>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="키워드 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">순위</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">키워드</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">검색 횟수</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">마지막 검색</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKeywords.map((keyword, index) => (
                  <tr key={keyword.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                        index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{keyword.keyword}</td>
                    <td className="px-4 py-3 text-gray-500">{keyword.searchCount.toLocaleString()}회</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {keyword.lastSearchedAt ? new Date(keyword.lastSearchedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(keyword.id, keyword.keyword)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredKeywords.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 키워드가 없습니다'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
