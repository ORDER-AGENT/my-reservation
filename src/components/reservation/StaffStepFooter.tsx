'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Staff } from '@/types/data';
import { useRouter } from 'next/navigation';

interface StaffStepFooterProps {
  selectedStaff: Staff | null;
}

export default function StaffStepFooter({
  selectedStaff,
}: StaffStepFooterProps) {
  const router = useRouter();

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            前に戻る
          </Button>
        </div>
        <div className="flex-grow text-center">
          <h2 className="text-lg font-semibold">選択中のスタッフ</h2>
          <p className="text-sm text-muted-foreground">
            {selectedStaff ? selectedStaff.name : '未選択'}
          </p>
        </div>
        <div>
          <Button
            size="lg"
            onClick={() => router.push('/customer/reservation/datetime')}
            disabled={!selectedStaff}
          >
            日時選択へ
          </Button>
        </div>
      </div>
    </div>
  );
}
