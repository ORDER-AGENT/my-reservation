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

