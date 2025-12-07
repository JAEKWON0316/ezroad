'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { reportApi, ReportTargetType } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
  targetName?: string;
}

const reportReasons = [
  '스팸/광고',
  '욕설/비방',
  '허위 정보',
  '부적절한 콘텐츠',
  '저작권 침해',
  '개인정보 노출',
  '기타',
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetName }: ReportModalProps) {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!reason) {
      toast.error('신고 사유를 선택해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportApi.create({
        targetType,
        targetId,
        reason,
        description: description || undefined,
      });
      toast.success('신고가 접수되었습니다');
      onClose();
      setReason('');
      setDescription('');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('이미 신고한 내용입니다');
      } else {
        toast.error('신고 접수에 실패했습니다');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetTypeLabel = {
    REVIEW: '리뷰',
    RESTAURANT: '식당',
    MEMBER: '회원',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">신고하기</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {targetTypeLabel[targetType]}: {targetName || `#${targetId}`}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            신고 사유 *
          </label>
          <div className="space-y-2">
            {reportReasons.map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 내용 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="신고 내용을 자세히 적어주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="flex-1"
          >
            {isSubmitting ? '접수 중...' : '신고 접수'}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
