'use client';

import { Reservation } from '@/types';
import ReservationCard from './ReservationCard';
import Loading from '@/components/common/Loading';
import { Calendar } from 'lucide-react';

interface ReservationListProps {
  reservations: Reservation[];
  isLoading?: boolean;
  onCancel?: (reservationId: number) => void;
  onConfirm?: (reservationId: number) => void;
  onComplete?: (reservationId: number) => void;
  isBusinessView?: boolean;
  emptyMessage?: string;
}

export default function ReservationList({
  reservations,
  isLoading = false,
  onCancel,
  onConfirm,
  onComplete,
  isBusinessView = false,
  emptyMessage = '예약 내역이 없습니다',
}: ReservationListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCancel={onCancel}
          onConfirm={onConfirm}
          onComplete={onComplete}
          isBusinessView={isBusinessView}
        />
      ))}
    </div>
  );
}
