import { useState, useEffect } from 'react';

export default function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    // 初期値をクライアントで設定
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    // リスナーを設定
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);

    // クリーンアップ
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * 画面サイズに関する状態を提供するカスタムフック。
 *
 * @returns {object} isLargeScreen, isSmallScreen, isMobile の真偽値（または初期化中はnull）を含むオブジェクト。
 * - `isLargeScreen`: 画面幅が1024px以上の場合にtrue。
 * - `isSmallScreen`: 画面幅が767px以下の場合にtrue。
 * - `isMobile`: `isSmallScreen` のエイリアス。
 */
export function useScreenSize() {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isSmallScreen = useMediaQuery('(max-width: 767px)');

  return {
    isLargeScreen,
    isSmallScreen,
    isMobile: isSmallScreen,
  };
}

/**
 * モバイルデバイスかどうかを判定するカスタムフック。
 * useScreenSize().isMobile のエイリアスです。
 *
 * @returns {boolean | null} モバイルサイズの場合はtrue、それ以外の場合はfalse。サーバーサイドレンダリング時や初期化中はnull。
 */
export function useIsMobile() {
  return useScreenSize().isMobile;
}

