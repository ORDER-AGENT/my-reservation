'use client';

import { useParams } from 'next/navigation';
import ServiceMenuStep from '@/components/reservation/ServiceMenuStep';
import StaffStep from '@/components/reservation/StaffStep';
import DateTimeStep from '@/components/reservation/DateTimeStep';
import CustomerInfoStep from '@/components/reservation/CustomerInfoStep';
import ConfirmStep from '@/components/reservation/ConfirmStep';
import CompleteStep from '@/components/reservation/CompleteStep';
import { useReservationNavigation } from '@/contexts/ReservationNavigationContext';

export default function ReservationStepPage() {
  const params = useParams();
  const step = params.step as string;
  const { onNextClick } = useReservationNavigation();

  const renderStepContent = () => {
    switch (step) {
      case 'service-menu':
        return <ServiceMenuStep />;
      case 'staff':
        return <StaffStep />;
      case 'datetime':
        return <DateTimeStep />;
      case 'customer-info':
        return <CustomerInfoStep onNextClick={onNextClick} />;
      case 'confirm':
        return <ConfirmStep />;
      case 'complete':
        return <CompleteStep />;
      default:
        // layout.tsx が不正なパスをリダイレクトするため、
        // ここでは何も表示しないか、ローディング表示が適切
        return null;
    }
  };

  return <>{renderStepContent()}</>;
}
