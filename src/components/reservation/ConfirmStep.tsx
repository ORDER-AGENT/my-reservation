'use client';

import { useAtomValue } from 'jotai';
import { selectedDateTimeAtom, selectedMenusAtom, selectedStaffAtom } from '@/atoms/reservation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfirmStep() {
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const selectedMenus = useAtomValue(selectedMenusAtom);
  const selectedStaff = useAtomValue(selectedStaffAtom);
  const router = useRouter();

  useEffect(() => {
    // メニューが選択されていない場合、メニュー選択画面にリダイレクト
    if (selectedMenus.length === 0) {
      router.replace('/customer/reservation/menu');
      return;
    }
    // スタッフが選択されていない場合、スタッフ選択画面にリダイレクト
    if (!selectedStaff) {
      router.replace('/customer/reservation/staff');
      return;
    }
    // 日時が選択されていない場合、日時選択画面にリダイレクト
    if (!selectedDateTime) {
      router.replace('/customer/reservation/datetime');
      return;
    }
  }, [selectedMenus, selectedStaff, selectedDateTime, router]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">予約内容の確認</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">選択内容</h2>
        <div className="space-y-2">
          <p><strong>日時:</strong> {selectedDateTime ? selectedDateTime.toLocaleString() : '未選択'}</p>
          <p><strong>メニュー:</strong> {selectedMenus.length > 0 ? selectedMenus.map(menu => menu.name).join(', ') : '未選択'}</p>
          <p><strong>スタッフ:</strong> {selectedStaff ? selectedStaff.name : '未選択'}</p>
        </div>
      </div>
    </div>
  );
}
