'use client';

import { useAtom } from 'jotai';
import {
  selectedMenusAtom,
  reservationTotalsAtom,
  selectedStaffAtom,
  selectedDateTimeAtom,
} from '@/atoms/reservation';
import ContentLayout from '@/components/layout/ContentLayout';
import MenuStep from '@/components/reservation/MenuStep';
import StaffStep from '@/components/reservation/StaffStep';
import DateTimeStep from '@/components/reservation/DateTimeStep';
import DateTimeStepHeader from '@/components/reservation/DateTimeStepHeader'; // 追加
import DateTimeStepFooter from '@/components/reservation/DateTimeStepFooter'; // 追加
import MenuStepHeader from '@/components/reservation/MenuStepHeader';
import MenuStepFooter from '@/components/reservation/MenuStepFooter';
import StaffStepHeader from '@/components/reservation/StaffStepHeader';
import StaffStepFooter from '@/components/reservation/StaffStepFooter';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { use } from 'react';

// Next.js の動的ルーティングから step パラメータを取得
interface ReservationPageProps {
  params: Promise<{
    step: string; // 'menu', 'staff', 'datetime', 'confirm'
  }>;
}

export default function ReservationPage({ params }: ReservationPageProps) {
  // React.use() で unwrap
  const { step } = use(params);
  const router = useRouter();

  const [selectedMenus] = useAtom(selectedMenusAtom);
  const [totals] = useAtom(reservationTotalsAtom);
  const [selectedStaff] = useAtom(selectedStaffAtom);
  const [selectedDateTime] = useAtom(selectedDateTimeAtom);

  const canProceedToStaffSelection = selectedMenus.length > 0;
  const canProceedToDateTimeSelection = !!selectedDateTime;

  const renderHeader = () => {
    switch (step) {
      case 'menu':
        return <MenuStepHeader />;
      case 'staff':
        return <StaffStepHeader />;
      case 'datetime':
        return <DateTimeStepHeader />; // 変更
      case 'confirm':
        return (
          <div className="p-2">
            <h1 className="text-xl font-bold">予約内容を確認してください</h1>
          </div>
        );
      default:
        // 未知のステップの場合、menu にリダイレクト
        router.replace('/customer/reservation/menu');
        return null;
    }
  };

  const renderFooter = () => {
    return (
      <div className="h-[80px] flex items-center justify-center">
        {(() => {
          switch (step) {
            case 'menu':
              return (
                <MenuStepFooter
                  canProceedToStaffSelection={canProceedToStaffSelection}
                  handleNextStep={() => router.push('/customer/reservation/staff')}
                  totals={totals}
                />
              );
            case 'staff':
              return (
                <StaffStepFooter
                  selectedStaff={selectedStaff}
                />
              );
            case 'datetime':
              return (
                <DateTimeStepFooter
                  canProceedToDateTimeSelection={canProceedToDateTimeSelection}
                  router={router}
                />
              ); // 変更
            case 'confirm':
              return (
                <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">合計金額</h2>
                      <p className="text-sm text-muted-foreground">
                        ¥{totals.price.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => console.log('予約確定！')}
                      disabled={true} // TODO: Implement confirmation logic
                      variant={true ? 'outline' : 'default'} // TODO: Implement confirmation logic
                    >
                      予約を確定する
                    </Button>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <ContentLayout
      headerContent={renderHeader()}
      isHeaderFixed={true}
      footerContent={renderFooter()}
      isFooterFixed={true}
    >
      {step === 'menu' && <MenuStep />}
      {step === 'staff' && <StaffStep />}
      {step === 'datetime' && <DateTimeStep />} {/* 変更 */}
      {/* {step === 'confirm' && <ConfirmStep />} */}
    </ContentLayout>
  );
}
