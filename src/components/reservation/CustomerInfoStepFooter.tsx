'use client';

import { useAtomValue } from 'jotai';
import { customerInfoAtom } from '@/atoms/reservation';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface CustomerInfoStepFooterProps {
  onNextClick: () => void;
  onBackClick: () => void;
}

export default function CustomerInfoStepFooter({ onNextClick, onBackClick }: CustomerInfoStepFooterProps) {
  const customerInfo = useAtomValue(customerInfoAtom);
  const { data: session } = useSession();

  // 次のステップに進める条件を定義
  // ログインしているか、または顧客情報が入力されているか
  const canProceed = !!session || !!customerInfo;

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBackClick}>
            戻る
          </Button>
        </div>
        <div>
          <Button onClick={onNextClick} disabled={!canProceed}>
            確認画面へ進む
          </Button>
        </div>
      </div>
    </div>
  );
}
