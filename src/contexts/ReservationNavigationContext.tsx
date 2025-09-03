'use client';

import { createContext, useContext } from 'react';

interface ReservationNavigationContextType {
  onNextClick: () => void;
  onBackClick: () => void;
}

const ReservationNavigationContext = createContext<ReservationNavigationContextType | undefined>(undefined);

export function useReservationNavigation() {
  const context = useContext(ReservationNavigationContext);
  if (context === undefined) {
    throw new Error('useReservationNavigation must be used within a ReservationNavigationProvider');
  }
  return context;
}

export default ReservationNavigationContext;
