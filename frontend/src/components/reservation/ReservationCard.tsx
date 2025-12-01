'use client';

import { Reservation } from '@/types';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import Button from '@/components/common/Button';
import { formatDate, formatTime, getReservationStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (reservationId: number) => void;
  onConfirm?: (reservationId: number) => void;
  onComplete?: (reservationId: number) => void;
  showActions?: boolean;
  isBusinessView?: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export default function ReservationCard({
  reservation,
  onCancel,
  onConfirm,
  onComplete,
  showActions = true,
  isBusinessView = false,
}: ReservationCardProps) {
  const isPending = reservation.status === 'PENDING';
  const isConfirmed = reservation.status === 'CONFIRMED';
  const isActive = isPending || isConfirmed;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      {/* 상태 배지 */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors[reservation.status]
          )}
        >
          {getReservationStatusLabel(reservation.status)}
        </span>
        <span className="text-sm text-gray-400">
          예약번호: {reservation.id}
        </span>
      </div>

      {/* 식당 정보 */}
      {reservation.restaurantName && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">
            {reservation.restaurantName}
          </h3>
          {reservation.restaurantAddress && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{reservation.restaurantAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* 예약 상세 */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">날짜</p>
            <p className="font-medium">{formatDate(reservation.reservationDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">시간</p>
            <p className="font-medium">{formatTime(reservation.reservationTime)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">인원</p>
            <p className="font-medium">{reservation.guestCount}명</p>
          </div>
        </div>
      </div>

      {/* 요청사항 */}
      {reservation.request && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">요청사항</p>
          <p className="text-sm text-gray-700">{reservation.request}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      {showActions && isActive && (
        <div className="flex gap-2 mt-4">
          {isBusinessView ? (
            <>
              {isPending && onConfirm && (
                <Button className="flex-1" onClick={() => onConfirm(reservation.id)}>
                  예약 확정
                </Button>
              )}
              {isConfirmed && onComplete && (
                <Button className="flex-1" onClick={() => onComplete(reservation.id)}>
                  방문 완료
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onCancel(reservation.id)}
                >
                  예약 취소
                </Button>
              )}
            </>
          ) : (
            onCancel && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onCancel(reservation.id)}
              >
                예약 취소
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
