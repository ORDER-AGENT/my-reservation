'use client';

import { Button } from '@/components/ui/button';
import { selectedDateTimeAtom, availableSlotsAtom } from '@/atoms/reservation';
import { useAtomValue } from 'jotai';

// 日付を "YYYY-MM-DD" 形式の文字列にフォーマットするヘルパー関数
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DateTimeStepFooterProps {
  onNextClick: () => void;
  onBackClick: () => void;
}

export default function DateTimeStepFooter({ onNextClick, onBackClick }: DateTimeStepFooterProps) {
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const availableSlots = useAtomValue(availableSlotsAtom);

  // selectedDateTimeが有効な予約枠に含まれているかチェック
  const isSelectedDateTimeAvailable = selectedDateTime
    ? availableSlots?.[formatDate(selectedDateTime)]?.includes(
        `${selectedDateTime.getHours().toString().padStart(2, '0')}:${selectedDateTime.getMinutes().toString().padStart(2, '0')}`
      ) ?? false
    : false;

  const canProceed = !!selectedDateTime && isSelectedDateTimeAvailable;

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
