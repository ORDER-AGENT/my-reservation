'use client';

import { useAtom } from 'jotai';
import {
  reservationStepAtom,
  selectedMenusAtom,
  reservationTotalsAtom,
} from '@/atoms/reservation';
import ContentLayout from '@/components/layout/ContentLayout';
import MenuStep from '@/components/reservation/MenuStep';
import StaffStep from '@/components/reservation/StaffStep';
import { Button } from '@/components/ui/button';

// ヘッダー
const createHeader = () => {
  return (
    <div className="p-2">
      <h1 className="text-xl font-bold">メニューを選択してください</h1>
    </div>
  );
};

export default function ReservationPage() {
  const [step, setStep] = useAtom(reservationStepAtom);
  const [selectedMenus] = useAtom(selectedMenusAtom);
  const [totals] = useAtom(reservationTotalsAtom);

  const handleNextStep = () => {
    if (selectedMenus.length > 0) {
      setStep('staff');
    }
  };

  // フッター
  const createFooter = () => {
    if (step !== 'menu') {
      return (
        <div className="p-4">
          <p className="text-center text-xs text-muted-foreground">© 2025 ORDER AGENT</p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">選択中のメニュー</h2>
            <p className="text-sm text-muted-foreground">
              合計: ¥{totals.price.toLocaleString()} / 約{totals.duration}分
            </p>
          </div>
          <Button size="lg" onClick={handleNextStep}>
            スタッフ選択へ
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ContentLayout
      headerContent={createHeader()}
      isHeaderFixed={true}
      footerContent={createFooter()}
      isFooterFixed={true}
    >
      {step === 'menu' && <MenuStep />}
      {step === 'staff' && <StaffStep />}
      {/* {step === 'datetime' && <DateTimeStep />} */}
      {/* {step === 'confirm' && <ConfirmStep />} */}
    </ContentLayout>
  );
}
