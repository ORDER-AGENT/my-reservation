'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAtomValue } from 'jotai';
import { selectedStaffAtom } from '@/atoms/reservation';

interface StaffStepFooterProps {
  onNextClick: () => void;
  onBackClick: () => void;
}

export default function StaffStepFooter({ onNextClick, onBackClick }: StaffStepFooterProps) {
  const selectedStaff = useAtomValue(selectedStaffAtom);
  const canProceed = !!selectedStaff;

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBackClick}>
            戻る
          </Button>
        </div>
        <div className="flex-grow text-center">
          <h2 className="md:text-lg font-semibold">選択中のスタッフ</h2>
          <p className="text-sm text-muted-foreground">
            {selectedStaff ? selectedStaff.name : '未選択'}
          </p>
        </div>
        <div>
          <Button
            onClick={onNextClick}
            disabled={!canProceed}
          >
            日時選択へ
          </Button>
        </div>
      </div>
    </div>
  );
}
