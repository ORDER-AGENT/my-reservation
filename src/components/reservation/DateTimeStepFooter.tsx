'use client';

import { Button } from '@/components/ui/button';
import { selectedDateTimeAtom } from '@/atoms/reservation';
import { useAtomValue } from 'jotai';

interface DateTimeStepFooterProps {
  onNextClick: () => void;
  onBackClick: () => void;
}

export default function DateTimeStepFooter({ onNextClick, onBackClick }: DateTimeStepFooterProps) {
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const canProceed = !!selectedDateTime;

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBackClick}>
            戻る
          </Button>
        </div>
        <div className="flex-grow text-center">
          <h2 className="md:text-lg font-semibold">選択中の日時</h2>
          <p className="text-sm text-muted-foreground">
            {selectedDateTime
              ? selectedDateTime.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '未選択'}
          </p>
        </div>
        <div>
          <Button
            onClick={onNextClick}
            disabled={!canProceed}
          >
            お客様情報入力へ
          </Button>
        </div>
      </div>
    </div>
  );
}
