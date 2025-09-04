'use client';

import ContentLayout from '@/components/layout/ContentLayout';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import React from 'react';
import { Doc } from '@/convex/_generated/dataModel';

import { format } from 'date-fns';

type ReservationStatus = Doc<'reservations'>['status'];
type ReservationWithDetails = typeof api.reservations.getAll._returnType[number];

const statusMap: Record<ReservationStatus, string> = {
  reserved: '予約',
  'in-progress': '対応中',
  completed: '完了',
  canceled: 'キャンセル',
};

const ReservationCard = ({
  reservation,
}: {
  reservation: ReservationWithDetails;
}) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border">
      <p className="font-bold text-lg mb-2">{reservation.customerName}</p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">サービス:</span> {reservation.serviceName}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">日時:</span>{' '}
        {format(new Date(reservation.dateTime), 'yyyy/MM/dd HH:mm')}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">担当:</span> {reservation.staffName}
      </p>
    </div>
  );
};

const ReservationBoardPage = () => {
  const reservations = useQuery(api.reservations.getAll);

  const groupedReservations = reservations?.reduce(
    (acc, reservation) => {
      const status = reservation.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(reservation);
      return acc;
    },
    {} as Record<ReservationStatus, ReservationWithDetails[]>
  );

  const statuses: ReservationStatus[] = [
    'reserved',
    'in-progress',
    'completed',
    'canceled',
  ];

  return (
    <ContentLayout>
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map((status) => (
            <div key={status}>
              <h2 className="font-bold text-xl mb-4 text-gray-800 border-b-2 pb-2">
                {statusMap[status]}
              </h2>
              <div className="space-y-4 overflow-y-auto p-1">
                {groupedReservations?.[status] &&
                groupedReservations[status].length > 0 ? (
                  groupedReservations[status].map((reservation) => (
                    <ReservationCard
                      key={reservation._id}
                      reservation={reservation}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    予約はありません
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ContentLayout>
  );
};

export default ReservationBoardPage;
