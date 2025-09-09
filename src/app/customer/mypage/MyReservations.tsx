'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { Skeleton } from '@/components/ui/skeleton';

export const MyReservations = () => {
  const reservations = useQuery(api.reservations.getMyReservations);

  const isLoading = reservations === undefined;
  const hasReservations = reservations && reservations.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">ご予約一覧</h2>
      {hasReservations ? (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation._id} reservation={reservation} />
          ))}
        </div>
      ) : (
        <p>現在、ご予約はありません。</p>
      )}
    </div>
  );
};
