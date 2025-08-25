'use client';

import React, { useState, useEffect } from 'react';
import MenuToggleButton from '@/components/menu/MenuToggleButton';
//import { useSession } from 'next-auth/react';
import AppLogo from '@/components/AppLogo';

interface AppHeaderProps {
  onMenuToggleClick: () => void;
}

export default function AppHeader({ onMenuToggleClick }: AppHeaderProps) {
  //const { status } = useSession();
  //const isAdmin = status === 'authenticated';
  const isDebug = true;
  const [isClient, setIsClient] = useState(false);

  // windowDimensions の初期値を SSR 時とクライアントで一致させる
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0, // SSR時には 0 を使用
    height: 0, // SSR時には 0 を使用
  });

  const [activeBreakpoint, setActiveBreakpoint] = useState<string>('');

  useEffect(() => {
    // このeffectはクライアント側でコンポーネントがマウントされた後にのみ実行されます
    setIsClient(true);

    const handleResize = () => {
      // クライアント側で実行される際に実際の値を設定
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Tailwind CSSのブレークポイントを判定
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      };

      let currentBreakpoint = 'base';
      for (const key in breakpoints) {
        if (window.innerWidth >= breakpoints[key as keyof typeof breakpoints]) {
          currentBreakpoint = key;
        }
      }
      setActiveBreakpoint(currentBreakpoint);
    };

    // コンポーネントがマウントされた後（クライアント側で）初回のみ実行
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[var(--header-height)] z-2 flex items-center bg-white/80 select-none w-full backdrop-blur-xl">
      {/* 追加: ヘッダー左側にトグルボタンとロゴを配置 */}
      <div className="flex items-center flex-shrink-0 w-[250px]">
        <MenuToggleButton onClick={onMenuToggleClick} />
        <AppLogo />
      </div>

      <h1 className="flex-grow m-0 pl-5 text-[1.2em]">{/*アプリケーションヘッダー*/}</h1>
      <div className="pr-5 text-[0.9em] text-[#555] text-right">
        {/* デバッグ表示のコンテナを flex で横並びに */}
        {isDebug && ( // デバッグ情報を表示
          // マウント後にクライアントサイドでのみこのブロックをレンダリングする
          isClient && (
            <div className="flex items-center justify-end gap-3.5"> {/* gap を調整 */}
              {/* windowDimensions と Breakpoint を縦に並べる */}
              <div className="flex flex-col items-end">
                <div>
                  {`${windowDimensions.width} x ${windowDimensions.height}`}
                </div>
                <div>Breakpoint: <span className="font-bold text-blue-600">{activeBreakpoint}</span></div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
} 