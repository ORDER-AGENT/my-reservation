'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useScreenSize } from '@/hooks/useMediaQuery';

// Contextが提供する値の型を定義
interface ScreenSizeContextType {
  isMobile: boolean | null;
  isLargeScreen: boolean | null;
}

// Contextを作成。初期値は undefined
const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined);

// Context Providerコンポーネント
export function ScreenSizeProvider({ children }: { children: ReactNode }) {
  const { isMobile, isLargeScreen } = useScreenSize();

  return (
    <ScreenSizeContext.Provider value={{ isMobile, isLargeScreen }}>
      {children}
    </ScreenSizeContext.Provider>
  );
}

// Contextの値を簡単に使うためのカスタムフック
export function useScreenSizeContext() {
  const context = useContext(ScreenSizeContext);
  if (context === undefined) {
    throw new Error('useScreenSizeContext must be used within a ScreenSizeProvider');
  }
  return context;
}
