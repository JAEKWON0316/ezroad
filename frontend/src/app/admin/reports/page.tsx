'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import { adminApi, Report, ReportStatus } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const statusLabels: Record<ReportStatus, string> = {
  PENDING: '대기중',
  RESOLVED: '처리완료',
  DISMISSED: '기각',
};

const statusColors: Record<ReportStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-800',
};

const targetTypeLabels: Record<string, string> = {
  REVIEW: '리뷰',
  RESTAURANT: '식당',
  MEMBER: '회원',
};

export default function AdminReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchReports();
    fetchStats();
  }, [user, statusFilter, page]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getReports({
        status: statusFilter || undefined,
        page,
        size: 20,
      });
      setReports(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('신고 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminApi.getReportStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport) return;
    try {
      setIsProcessing(true);
      await adminApi.resolveReport(selectedReport.id, adminNote);
      toast.success('신고가 처리되었습니다');
      setSelectedReport(null);
      setAdminNote('');
      fetchReports();
      fetchStats();
    } catch (error) {
      toast.error('처리에 실패했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;
    try {
      setIsProcessing(true);
      await adminApi.dismissReport(selectedReport.id, adminNote);
      toast.success('신고가 기각되었습니다');
      setSelectedReport(null);
      setAdminNote('');
      fetchReports();
      fetchStats();
    } catch (error) {
      toast.error('처리에 실패했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">신고 관리</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Clock />} label="대기중" value={stats.pending || 0} color="yellow" />
          <StatCard icon={<CheckCircle />} label="처리완료" value={stats.resolved || 0} color="green" />
          <StatCard icon={<XCircle />} label="기각" value={stats.dismissed || 0} color="gray" />
          <StatCard icon={<AlertTriangle />} label="전체" value={stats.total || 0} color="blue" />
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as ReportStatus | ''); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">전체 상태</option>
              <option value="PENDING">대기중</option>
              <option value="RESOLVED">처리완료</option>
              <option value="DISMISSED">기각</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">대상</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">사유</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">신고자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">신고일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{report.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{targetTypeLabels[report.targetType]}</span>
                      <span className="text-gray-500 ml-1">#{report.targetId}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{report.reason}</td>
                    <td className="px-4 py-3 text-sm">{report.reporterNickname}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[report.status]}`}>
                        {statusLabels[report.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                신고 내역이 없습니다
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* 상세 모달 */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">신고 상세</h3>
              
              <div className="space-y-3 mb-4">
                <div><span className="text-gray-500">대상:</span> {targetTypeLabels[selectedReport.targetType]} #{selectedReport.targetId}</div>
                <div><span className="text-gray-500">사유:</span> {selectedReport.reason}</div>
                {selectedReport.description && (
                  <div><span className="text-gray-500">상세:</span> {selectedReport.description}</div>
                )}
                <div><span className="text-gray-500">신고자:</span> {selectedReport.reporterNickname}</div>
                <div><span className="text-gray-500">신고일:</span> {new Date(selectedReport.createdAt).toLocaleString()}</div>
              </div>

              {selectedReport.status === 'PENDING' && (
                <>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="관리자 메모 (선택)"
                    className="w-full px-3 py-2 border rounded-lg mb-4"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleResolve} disabled={isProcessing} className="flex-1">
                      처리 완료
                    </Button>
                    <Button onClick={handleDismiss} variant="outline" disabled={isProcessing} className="flex-1">
                      기각
                    </Button>
                  </div>
                </>
              )}

              {selectedReport.status !== 'PENDING' && selectedReport.adminNote && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-gray-500">관리자 메모</div>
                  <div>{selectedReport.adminNote}</div>
                </div>
              )}

              <button
                onClick={() => { setSelectedReport(null); setAdminNote(''); }}
                className="w-full mt-4 text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
