'use client';

import { useAtomValue } from 'jotai';
import {
  selectedDateTimeAtom,
  selectedMenusAtom,
  selectedStaffAtom,
  customerInfoAtom,
  reservationTotalsAtom,
} from '@/atoms/reservation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConfirmStep() {
  const { data: session } = useSession();
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const selectedMenus = useAtomValue(selectedMenusAtom);
  const selectedStaff = useAtomValue(selectedStaffAtom);
  const customerInfo = useAtomValue(customerInfoAtom);
  const totals = useAtomValue(reservationTotalsAtom);
  const router = useRouter();

  // 店舗情報を取得
  const store = useQuery(api.stores.getFirst);

  const createGuestReservation = useMutation(api.reservations.createGuestReservation);
  const createReservation = useMutation(api.reservations.createReservation);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 予約情報が不足している場合は適切なステップにリダイレクト
  useEffect(() => {
    if (selectedMenus.length === 0) router.replace('/customer/reservation/menu');
    if (!selectedStaff) router.replace('/customer/reservation/staff');
    if (!selectedDateTime) router.replace('/customer/reservation/datetime');
    if (!customerInfo) router.replace('/customer/reservation/customer-info');
  }, [selectedMenus, selectedStaff, selectedDateTime, customerInfo, router]);

  const handleConfirm = async () => {
    if (!store) {
      toast.error('店舗情報が読み込めませんでした。もう一度お試しください。');
      return;
    }
    if (!selectedDateTime || !selectedStaff || selectedMenus.length === 0 || !customerInfo) {
      toast.error('予約情報が不完全です。前のステップに戻って入力を確認してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const storeId = store._id;
      const primaryMenu = selectedMenus[0];

      let reservationNumber;

      if (session?.user) {
        // ログインユーザーの予約
        const result = await createReservation({
          staffId: selectedStaff._id as Id<'staffs'>,
          serviceId: primaryMenu._id as Id<'services'>,
          storeId: storeId,
          dateTime: selectedDateTime.getTime(),
          totalPrice: totals.price,
          totalDuration: totals.duration,
        });
        reservationNumber = result.reservationNumber;
      } else {
        // ゲストユーザーの予約
        const result = await createGuestReservation({
          staffId: selectedStaff._id as Id<'staffs'>,
          serviceId: primaryMenu._id as Id<'services'>,
          storeId: storeId,
          dateTime: selectedDateTime.getTime(),
          totalPrice: totals.price,
          totalDuration: totals.duration,
          guestName: customerInfo.name,
          guestEmail: customerInfo.email,
          guestPhone: customerInfo.phone,
        });
        reservationNumber = result.reservationNumber;
      }

      toast.success(`予約が確定しました。予約番号: ${reservationNumber}`);
      router.push('/customer/reservation/complete');

    } catch (error) {
      console.error(error);
      toast.error('予約の確定に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  // customerInfoまたはstoreがロードされるまでスケルトン表示
  if (!customerInfo || !store) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>予約内容の最終確認</CardTitle>
          <CardDescription>最終確認の準備をしています...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 p-4 border rounded-md">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-2 p-4 border rounded-md">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>予約内容の最終確認</CardTitle>
        <CardDescription>以下の内容でよろしければ、予約を確定してください。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 p-4 border rounded-md">
          <p><strong>お客様情報:</strong></p>
          <p>・氏名: {customerInfo.name}</p>
          <p>・電話番号: {customerInfo.phone}</p>
          <p>・メールアドレス: {customerInfo.email}</p>
        </div>
        <div className="space-y-2 p-4 border rounded-md">
          <p><strong>予約内容:</strong></p>
          <p>・日時: {selectedDateTime?.toLocaleString('ja-JP')}</p>
          <p>・メニュー: {selectedMenus.map(menu => menu.name).join(', ')}</p>
          <p>・スタッフ: {selectedStaff?.user.name}</p>
          <p>・合計料金: ¥{totals.price.toLocaleString()}</p>
          <p>・合計時間: 約{totals.duration}分</p>
        </div>
        <Button onClick={handleConfirm} disabled={isSubmitting || !store} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? '予約処理中...' : 'この内容で予約を確定する'}
        </Button>
      </CardContent>
    </Card>
  );
}