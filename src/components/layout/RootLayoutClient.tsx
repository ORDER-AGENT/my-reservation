'use client';

import Sidebar from '@/components/menu/Sidebar';
import AppHeader from '@/components/layout/AppHeader';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import useMediaQuery from '@/hooks/useMediaQuery';
import FooterMenu from '@/components/menu/FooterMenu';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Cookies from 'js-cookie';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

// ルートレイアウトのクライアントコンポーネント
export default function RootLayoutClient({
  children,
  initialIsMenuOpen, // サーバーから渡される初期状態
}: {
  children: React.ReactNode;
  initialIsMenuOpen: boolean;
}) {
  // サーバーから渡された初期値で状態を初期化
  const [isMenuOpen, setIsMenuOpen] = useState(initialIsMenuOpen);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isSmallScreen = useMediaQuery('(max-width: 767px)');

  // 画面サイズが変更された時の追従処理
  useEffect(() => {
    // isLargeScreenが未確定のうちは何もしない
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
    <>
      {/* NextAuth.jsのセッションプロバイダ */}
      <SessionProvider>
        <ConvexProvider client={convex}>
          <div className="flex flex-col h-[100dvh]">
            {/* ヘッダー部分をコンポーネントとしてレンダリング */}
            <AppHeader onMenuToggleClick={handleMenuToggleClick} />

            <div
              className={`flex flex-grow pt-[var(--header-height)] ${
                isSmallScreen ? 'pb-[var(--footer-menu-height)]' : ''
              }`}
            >
              {/* サイドバーコンポーネント */}
              <Sidebar
                isMenuOpen={isMenuOpen}
                onMenuToggleClick={handleMenuToggleClick}
              />
              {/* メインコンテンツ領域 */}
              <main
                className={`flex-grow overflow-auto transition-[margin-left] duration-[var(--sidebar-animation-duration)] ease-in-out ${
                  isMenuOpen
                    ? 'lg:ml-[var(--sidebar-width-open)] md:ml-[var(--sidebar-width-closed)]'
                    : 'lg:ml-[var(--sidebar-width-closed)] md:ml-[var(--sidebar-width-closed)]'
                }`}
              >
                {children}
                {/* トースト通知表示エリア */}
                <Toaster />
              </main>
            </div>
          </div>

          {isSmallScreen && <FooterMenu />}
        </ConvexProvider>
      </SessionProvider>
    </>
  );
} 