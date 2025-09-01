'use client';

import React, { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ScreenSizeProvider, useScreenSizeContext } from '@/contexts/ScreenSizeContext';
import Sidebar from '@/components/menu/Sidebar';
import AppHeader from '@/components/layout/AppHeader';
import { Toaster } from '@/components/ui/sonner';
import FooterMenu from '@/components/menu/FooterMenu';
import Cookies from 'js-cookie';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

/**
 * 実際のレイアウトとロジックを持つコンポーネント。
 * Providerの内側で呼び出されるため、Contextを安全に使用できる。
 */
function MainLayout({ children, initialIsMenuOpen }: {
  children: React.ReactNode;
  initialIsMenuOpen: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(initialIsMenuOpen);
  const { isLargeScreen, isMobile } = useScreenSizeContext(); // Contextから値を取得

  // 画面サイズが変更された時の追従処理
  useEffect(() => {
    if (isLargeScreen === null) return;

    if (!isLargeScreen) {
      // 大画面でなくなった場合は、メニューを強制的に閉じる
      setIsMenuOpen(false);
    } else {
      // 大画面になった場合は、Cookieから再度状態を取得して設定する
      const savedState = Cookies.get('sidebarOpenState');
      // Cookieに保存された値があればそれを使い、なければデフォルトで開く
      setIsMenuOpen(savedState !== undefined ? savedState === 'true' : true);
    }
  }, [isLargeScreen]);

  const handleMenuToggleClick = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    // 大画面の時だけ、状態変更をCookieに保存する
    if (isLargeScreen) {
      Cookies.set('sidebarOpenState', String(newState), { expires: 365 });
    }
  };

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="z-10">
        <AppHeader onMenuToggleClick={handleMenuToggleClick} />
      </div>

      <div
        className={`flex flex-grow pt-[var(--header-height)] ${
          isMobile ? 'pb-[var(--footer-menu-height)]' : ''
        }`}
      >
        {/* サイドバー */}
        <Sidebar
          isMenuOpen={isMenuOpen}
          onMenuToggleClick={handleMenuToggleClick}
        />

        {/* メインコンテンツ */}
        <main
          className={`flex-grow transition-[margin-left] duration-[var(--sidebar-animation-duration)] ease-in-out ${
            isMenuOpen
              ? 'lg:ml-[var(--sidebar-width-open)] md:ml-[var(--sidebar-width-closed)]'
              : 'lg:ml-[var(--sidebar-width-closed)] md:ml-[var(--sidebar-width-closed)]'
          }`}
        >
          {children}
          <Toaster position="top-center" richColors />
        </main>
      </div>
      {isMobile && <FooterMenu />}
    </div>
  );
}

/**
 * ルートレイアウトのクライアント側エントリポイント。
 * 主に各種Providerを設定する責務を持つ。
 */
export default function RootLayoutClient({
  children,
  initialIsMenuOpen,
}: {
  children: React.ReactNode;
  initialIsMenuOpen: boolean;
}) {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <ScreenSizeProvider>
          <MainLayout initialIsMenuOpen={initialIsMenuOpen}>
            {children}
          </MainLayout>
        </ScreenSizeProvider>
      </ConvexProvider>
    </SessionProvider>
  );
} 