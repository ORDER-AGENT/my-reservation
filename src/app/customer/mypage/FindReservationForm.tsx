'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FindReservationForm = () => {
  const [reservationNumber, setReservationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [searchParams, setSearchParams] = useState<{
    reservationNumber: string;
    phone: string;
  } | null>(null);

  const reservation = useQuery(
    api.reservations.findReservationByNumberAndPhone,
    searchParams ? { ...searchParams } : 'skip',
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationNumber || !phone) return;
    setSearchParams({ reservationNumber, phone });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>予約の確認</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reservationNumber">予約番号</label>
            <Input
              id="reservationNumber"
              value={reservationNumber}
              onChange={(e) => setReservationNumber(e.target.value)}
              placeholder="予約番号を入力"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone">電話番号</label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="電話番号を入力"
              required
            />
          </div>
          <Button type="submit">予約を検索</Button>
        </form>

        {searchParams && reservation === null && (
          <div className="mt-4 text-center text-red-500">
            予約が見つかりませんでした。
          </div>
        )}

        {reservation && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">予約情報</h3>
            <ReservationCard reservation={reservation} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
