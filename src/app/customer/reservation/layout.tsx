'use client';

import { usePathname, useRouter } from 'next/navigation';
import ContentLayout from '@/components/layout/ContentLayout';
import ReservationStepIndicator from '@/components/reservation/ReservationStepIndicator';
import ServiceMenuStepFooter from '@/components/reservation/ServiceMenuStepFooter';
import StaffStepFooter from '@/components/reservation/StaffStepFooter';
import DateTimeStepFooter from '@/components/reservation/DateTimeStepFooter';
import CustomerInfoStepFooter from '@/components/reservation/CustomerInfoStepFooter';
import ConfirmFooter from '@/components/reservation/ConfirmFooter';
import { useEffect } from 'react';
import { stepOrder } from '@/types/reservation';
import ReservationNavigationContext from '@/contexts/ReservationNavigationContext';

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const step = pathname.split('/').pop() || stepOrder[0];
  const currentStepIndex = (stepOrder as readonly string[]).indexOf(step);

  useEffect(() => {
    // 無効なステップURLの場合は最初のステップにリダイレクト
    if (currentStepIndex === -1 && step !== 'complete') {
      router.replace(`/customer/reservation/${stepOrder[0]}`);
    }
  }, [step, currentStepIndex, router]);

  const handleNext = () => {
    const nextStep = stepOrder[currentStepIndex + 1];
    if (nextStep) {
      router.push(`/customer/reservation/${nextStep}`);
    }
  };

  const handleBack = () => {
    const backStep = stepOrder[currentStepIndex - 1];
    if (backStep) {
      router.push(`/customer/reservation/${backStep}`);
    }
    else {
      router.push(`/`);
    }
  };

  const renderHeader = () => {
    const showStepIndicator = currentStepIndex !== -1;
    return (
      <div className="h-[var(--reservation-footer-height)] ">
        {showStepIndicator && <ReservationStepIndicator currentStep={currentStepIndex + 1} />}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="h-[var(--reservation-footer-height)] flex items-center justify-center">
        {step === 'service-menu' && <ServiceMenuStepFooter onNextClick={handleNext} onBackClick={handleBack} />}
        {step === 'staff' && <StaffStepFooter onNextClick={handleNext} onBackClick={handleBack} />}
        {step === 'datetime' && <DateTimeStepFooter onNextClick={handleNext} onBackClick={handleBack} />}
        {step === 'customer-info' && <CustomerInfoStepFooter onNextClick={handleNext} onBackClick={handleBack} />}
        {step === 'confirm' && <ConfirmFooter onBackClick={handleBack} />}
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
      <ReservationNavigationContext.Provider value={{ onNextClick: handleNext, onBackClick: handleBack }}>
        {children}
      </ReservationNavigationContext.Provider>
    </ContentLayout>
  );
}
