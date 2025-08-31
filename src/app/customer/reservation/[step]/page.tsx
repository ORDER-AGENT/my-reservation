'use client';

import ServiceMenuStep from '@/components/reservation/ServiceMenuStep';
import StaffStep from '@/components/reservation/StaffStep';
import DateTimeStep from '@/components/reservation/DateTimeStep';
import ConfirmStep from '@/components/reservation/ConfirmStep';
import CompleteStep from '@/components/reservation/CompleteStep';
import { use } from 'react';

// Next.js の動的ルーティングから step パラメータを取得
interface ReservationPageProps {
  params: Promise<{
    step: string; // 'menu', 'staff', 'datetime', 'confirm', 'complete'
  }>;
}

export default function ReservationPage({ params }: ReservationPageProps) {
  // React.use() で unwrap
  const { step } = use(params);

  return (
    <>
      {step === 'menu' && <ServiceMenuStep />}
      {step === 'staff' && <StaffStep />}
      {step === 'datetime' && <DateTimeStep />}
      {step === 'confirm' && <ConfirmStep />}
      {step === 'complete' && <CompleteStep />}
    </>
  );
}