'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  selectedMenusAtom,
  selectedStaffAtom,
  resetReservationAtom, // resetReservationAtom をインポート
} from '@/atoms/reservation';

import useLocalStorage from '@/hooks/useLocalStorage';
import type { LastReservation } from '@/types/data';

export default function CompleteStep() {
  const router = useRouter();
  // 保存する値を取得
  const selectedMenus = useAtomValue(selectedMenusAtom);
  const selectedStaff = useAtomValue(selectedStaffAtom);
  // リセット用のセッター関数を取得
  const resetReservation = useSetAtom(resetReservationAtom);
  const { setItem } = useLocalStorage<LastReservation>('lastReservation');

  useEffect(() => {
    if (selectedMenus.length > 0 || selectedStaff) {
      const reservationData = {
        menus: selectedMenus,
        staff: selectedStaff,
        timestamp: new Date().toISOString(),
      };
      setItem(reservationData);

      // まとめたリセット処理を呼び出す
      resetReservation();
    }
  }, [selectedMenus, selectedStaff, resetReservation, setItem]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">予約が完了しました！</h1>
      <p className="text-lg text-gray-700 mb-8">ご予約ありがとうございます。<br />詳細は後ほどメールにてご連絡いたします。</p>
      <Button onClick={() => router.push('/')}>
        トップページに戻る
      </Button>
    </div>
  );
}