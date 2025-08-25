'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { reservationStepAtom, selectedStaffAtom } from '@/atoms/reservation';
import { Button } from '@/components/ui/button';
import { staffList } from '@/mocks/data';

export default function StaffStep() {
  const [, setStep] = useAtom(reservationStepAtom);
  const [selectedStaff, setSelectedStaff] = useAtom(selectedStaffAtom);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        担当者を選択してください
      </h1>
      {/* スタッフ選択のUIをここに実装 */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep('menu')}>
          前に戻る
        </Button>
        <Button onClick={() => setStep('datetime')} disabled={!selectedStaff}>
          日時選択へ
        </Button>
      </div>
    </div>
  );
}
