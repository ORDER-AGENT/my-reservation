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
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmStep() {
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const selectedMenus = useAtomValue(selectedMenusAtom);
  const selectedStaff = useAtomValue(selectedStaffAtom);
  const customerInfo = useAtomValue(customerInfoAtom);
  const totals = useAtomValue(reservationTotalsAtom);
  const router = useRouter();

  const createReservation = useMutation(api.reservations.createGuestReservation);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 予約情報が不足している場合は適切なステップにリダイレクト
  useEffect(() => {
    if (selectedMenus.length === 0) router.replace('/customer/reservation/menu');
    if (!selectedStaff) router.replace('/customer/reservation/staff');
    if (!selectedDateTime) router.replace('/customer/reservation/datetime');
    if (!customerInfo) router.replace('/customer/reservation/customer-info');
  }, [selectedMenus, selectedStaff, selectedDateTime, customerInfo, router]);

  const handleConfirm = async () => {
    if (!selectedDateTime || !selectedStaff || selectedMenus.length === 0 || !customerInfo) {
      toast.error('予約情報が不完全です。前のステップに戻って入力を確認してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: storeIdは将来的に動的に取得するように修正
      const dummyStoreId = 'j0x1y2z3w4v5t6s7r8q9p0o1n2m3l4k5' as any; // ConvexのID形式に合わせる
      // TODO: 複数メニュー選択に対応
      const primaryMenu = selectedMenus[0];

      const { reservationNumber } = await createReservation({
        staffId: selectedStaff.id as any,
        serviceId: primaryMenu.id as any,
        storeId: dummyStoreId,
        dateTime: selectedDateTime.getTime(),
        totalPrice: totals.price,
        totalDuration: totals.duration,
        guestName: customerInfo.name,
        guestEmail: customerInfo.email,
        guestPhone: customerInfo.phone,
      });

      toast.success(`予約が確定しました。予約番号: ${reservationNumber}`);
      router.push('/customer/reservation/complete');

    } catch (error) {
      console.error(error);
      toast.error('予約の確定に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  if (!customerInfo) {
    return null; // リダイレクトされるまでの間の表示
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
          <p>・スタッフ: {selectedStaff?.name}</p>
          <p>・合計料金: ¥{totals.price.toLocaleString()}</p>
          <p>・合計時間: 約{totals.duration}分</p>
        </div>
        <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? '予約処理中...' : 'この内容で予約を確定する'}
        </Button>
      </CardContent>
    </Card>
  );
}