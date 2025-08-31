'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
  selectedMenusAtom,
  reservationTotalsAtom,
  selectedStaffAtom,
  selectedDateTimeAtom,
} from '@/atoms/reservation';
import ContentLayout from '@/components/layout/ContentLayout';
import ReservationStepIndicator from '@/components/reservation/ReservationStepIndicator';
import ServiceMenuStepFooter from '@/components/reservation/ServiceMenuStepFooter';
import StaffStepFooter from '@/components/reservation/StaffStepFooter';
import DateTimeStepFooter from '@/components/reservation/DateTimeStepFooter';
import ConfirmFooter from '@/components/reservation/ConfirmFooter';
import { useEffect } from 'react';

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // パスから現在のステップを判別
  const step = pathname.split('/').pop() || 'menu';

  const [selectedMenus] = useAtom(selectedMenusAtom);
  const [totals] = useAtom(reservationTotalsAtom);
  const [selectedStaff] = useAtom(selectedStaffAtom);
  const [selectedDateTime] = useAtom(selectedDateTimeAtom);

  const canProceedToStaffSelection = selectedMenus.length > 0;
  const canProceedToDateTimeSelection = !!selectedDateTime;

  const handleConfirm = () => {
    console.log('予約を確定しました！', { selectedMenus, totals, selectedStaff, selectedDateTime });
    // TODO: 予約確定後の処理（API呼び出しなど）
    router.push('/customer/reservation/complete'); // 完了画面へ遷移
  };

  const currentStep = (() => {
    switch (step) {
      case 'menu': return 1;
      case 'staff': return 2;
      case 'datetime': return 3;
      case 'confirm': return 4;
      case 'complete': return 5;
      default: return 1;
    }
  })();

  const validSteps = ['menu', 'staff', 'datetime', 'confirm', 'complete'];
  useEffect(() => {
    if (!validSteps.includes(step)) {
      router.replace('/customer/reservation/menu');
    }
  }, [step, router]);

  const renderHeader = () => {
    const showStepIndicator = ['menu', 'staff', 'datetime', 'confirm'].includes(step);
    return (
      <div className="h-[var(--reservation-footer-height)] ">
        {showStepIndicator && (
          <ReservationStepIndicator currentStep={currentStep} />
        )}
      </div>
    );
  };

  const renderFooter = () => (
    <div className="h-[var(--reservation-footer-height)] flex items-center justify-center">
      {step === 'menu' && (
        <ServiceMenuStepFooter
          canProceedToStaffSelection={canProceedToStaffSelection}
          handleNextStep={() => router.push('/customer/reservation/staff')}
          totals={totals}
        />
      )}
      {step === 'staff' && <StaffStepFooter selectedStaff={selectedStaff} />}
      {step === 'datetime' && <DateTimeStepFooter canProceedToDateTimeSelection={canProceedToDateTimeSelection} />}
      {step === 'confirm' && <ConfirmFooter totals={totals} handleConfirm={handleConfirm} />}
    </div>
  );

  return (
    <ContentLayout
      headerContent={renderHeader()}
      isHeaderFixed={true}
      footerContent={renderFooter()}
      isFooterFixed={true}
    >
      {children}
    </ContentLayout>
  );
}
