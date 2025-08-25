'use client';

import React from 'react';
import { useScreenSizeContext } from '@/contexts/ScreenSizeContext';

// ContentLayoutコンポーネントのPropsの型定義
interface ContentLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  headerContent?: React.ReactNode;
  isHeaderFixed?: boolean;
  footerContent?: React.ReactNode;
  isFooterFixed?: boolean;
}

// ページ全体のレイアウトを提供するコンポーネント
export default function ContentLayout({
  children,
  headerContent,
  isHeaderFixed = false,
  footerContent,
  isFooterFixed = false,
}: ContentLayoutProps) {
  const { isMobile } = useScreenSizeContext(); // ContextからisMobileを取得

  console.log('ContentLayout - isMobile:', isMobile);

  return (
    <div className="flex-1 flex flex-col bg-[var(--content-background)] min-w-0 h-full">
      {/* ヘッダー */}
      {headerContent && (
        <div
          className={`px-4 py-4 border-b border-gray-200 ${
            isHeaderFixed
              ? 'sticky top-[var(--header-height)] z-10 bg-[var(--content-background)]/80 backdrop-blur-xl'
              : 'mb-4'
          }`}
        >
          {headerContent}
        </div>
      )}

      {/* コンテンツ */}
      <div
        className={`flex-grow px-4 pb-4 ${headerContent && isHeaderFixed ? 'pt-0' : 'pt-4'}`}
      >
        {children}
      </div>

      {/* フッター */}
      {footerContent && (
        <div
          className={`mt-4 px-4 py-4 border-t border-gray-200 ${
            isFooterFixed
              ? `sticky z-10 bg-[var(--content-background)]/80 backdrop-blur-xl ${
                  isMobile ? 'bottom-[var(--footer-menu-height)]' : 'bottom-0'
                }`
              : ''
          }`}
        >
          {footerContent}
        </div>
      )}
    </div>
  );
}
