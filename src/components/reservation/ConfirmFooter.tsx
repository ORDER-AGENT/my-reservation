import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ReservationTotals } from '@/atoms/reservation';

interface ConfirmFooterProps {
  // 必要に応じてpropsを追加
  totals: ReservationTotals;
  handleConfirm: () => void;
}

export default function ConfirmFooter({ totals, handleConfirm }: ConfirmFooterProps) {
  const router = useRouter();

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            戻る
          </Button>
        </div>
        <div className="flex-grow text-center">
          <h2 className="md:text-lg font-semibold">合計金額</h2>
          <p className="text-sm text-muted-foreground">
            ¥{totals.price.toLocaleString()}
          </p>
        </div>
        <div>
          <Button
            onClick={handleConfirm}
            // disabled={true} // TODO: Implement confirmation logic
            // variant={true ? 'outline' : 'default'} // TODO: Implement confirmation logic
          >
            予約を確定する
          </Button>
        </div>
      </div>
    </div>
  );
}
