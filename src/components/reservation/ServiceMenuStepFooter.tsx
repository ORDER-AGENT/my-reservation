'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { ReservationTotals } from '@/atoms/reservation';
import { useRouter } from 'next/navigation';

interface MenuStepFooterProps {
  canProceedToStaffSelection: boolean;
  handleNextStep: () => void;
  totals: ReservationTotals;
}

export default function MenuStepFooter({
  canProceedToStaffSelection,
  handleNextStep,
  totals,
}: MenuStepFooterProps) {
  const router = useRouter();

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
        </div>
        <div className="flex-grow text-center">
          <h2 className="md:text-lg font-semibold">選択中のメニュー</h2>
          <p className="text-sm text-muted-foreground">
            合計: ¥{totals.price.toLocaleString()} / 約{totals.duration}分
          </p>
        </div>
        <div>
          <Button
            onClick={handleNextStep}
            disabled={!canProceedToStaffSelection}
            variant={canProceedToStaffSelection ? 'default' : 'outline'}
          >
            スタッフ選択へ
          </Button>
        </div>
      </div>
    </div>
  );
}
