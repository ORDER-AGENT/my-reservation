'use client';

import { TbLogin2, TbLogout2 } from 'react-icons/tb';
import React, { useState, useEffect } from 'react';
import SidebarMenuItem from './SidebarMenuItem';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import SidebarContent from './SidebarContent';
import SidebarHeader from './SidebarHeader';
import { usePathname } from 'next/navigation';
import useMediaQuery from '@/hooks/useMediaQuery';
import { getSidebarMenuItems } from '@/data/sidebarMenuItems';
import { SidebarMenuItemType } from '@/types/sidebar';

interface SidebarProps {
  onMenuToggleClick: () => void; // AppHeader に渡すためのプロップ
  isMenuOpen: boolean; // AppHeader に渡すためのプロップ
}

export default function Sidebar({ onMenuToggleClick, isMenuOpen }: SidebarProps) {
  // ステート変数の定義
  const router = useRouter(); // Next.jsのルーターフック
  const { status } = useSession(); // NextAuth.jsのセッション情報を取得
  const pathname = usePathname(); // 現在のパスを取得
  const [touchStartX, setTouchStartX] = useState(0); // スワイプ開始時のX座標を保持するステート
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // オーバーレイメニューの表示状態を制御する新しいステート
  
  // ログイン状態を判定
  const isLoggedIn = status === 'authenticated';

  // ログイン状態に基づいてロールを決定（暫定対応）
  const userRoles = isLoggedIn ? ['admin', 'guest'] : ['guest'];

  const handleSidebarToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    // クリックがコンテナ自身（空白領域）から発生した場合にのみトグルを実行
    if (e.target === e.currentTarget) {
      onMenuToggleClick();
    }
  };

  // ログイン/ログアウトメニュー項目をレンダリングするヘルパー関数
  const renderAuthMenuItem = (isMenuOpenForText: boolean, keyPrefix: string, isOverlay: boolean) => {
    const menuOpenState = isMenuOpenForText;
 
    return isLoggedIn ? (
      <SidebarMenuItem
        key={`${keyPrefix}logout`}
        icon={() => <TbLogout2 className="size-6" />}
        text="管理者ログアウト"
        isMenuOpen={menuOpenState}
        isSelected={false}
        isHovered={hoveredItem === 'logout'}
        onMouseEnter={() => setHoveredItem('logout')}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => !isOverlayVisible ? handleMenuItemClick('logout') : handleOverlayItemClick('logout')}
        path="/"
        isExternal={false}
        isOverlay={isOverlay}
      />
    ) : (
      <SidebarMenuItem
        key={`${keyPrefix}admin`}
        icon={() => <TbLogin2 className="size-6" />}
        text="管理者"
        isMenuOpen={menuOpenState}
        isSelected={pathname === '/admin'}
        isHovered={hoveredItem === 'admin'}
        onMouseEnter={() => setHoveredItem('admin')}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => !isOverlayVisible ? handleMenuItemClick('admin') : handleOverlayItemClick('admin')}
        path="/admin"
        isExternal={false}
        isOverlay={isOverlay}
      />
    );
  };

  useEffect(() => {
    // オーバーレイメニューの表示状態を制御
    if (isLargeScreen !== null && !isLargeScreen && isMenuOpen) {
      // 大画面でなく、かつメニューが開いている場合、少し遅延させて表示状態をtrueにする
      // これにより、DOMにマウントされた後にアニメーションが開始される
      const timer = setTimeout(() => {
        setIsOverlayVisible(true);
      }, 50); // 短い遅延（例: 50ms）
      return () => clearTimeout(timer); // クリーンアップ
    } else {
      // それ以外の場合（メニューが閉じている、または大画面の場合）は直ちに非表示状態にする
      setIsOverlayVisible(false);
    }

  }, [isMenuOpen, isLargeScreen]); // isMenuOpen と isLargeScreen に依存

  // ホバー中のアイテムキーを管理
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 静的なメニュー項目データを定義
  const staticMenuItems: SidebarMenuItemType[] = getSidebarMenuItems(userRoles);
  
  // TODO: 動的なメニュー項目を取得するロジックを実装
  // const [dynamicMenuItems, setDynamicMenuItems] = useState<SidebarMenuItemType[] | null>(null);
  // useEffect(() => {
  //   // 例: APIから動的メニュー項目を非同期で取得
  //   const fetchDynamicMenuItems = async () => {
  //     try {
  //       // const items = await fetch('/api/dynamic-menu');
  //       // setDynamicMenuItems(items);
  //     } catch (error) {
  //       console.error('Failed to fetch dynamic menu items:', error);
  //     }
  //   };
  //   fetchDynamicMenuItems();
  // }, []);
  /*
    // Convexからリンク集のデータを取得
    //const dynamicLinks = useQuery(api.link.getLinks);

    // Convex等から取得した外部リンクをメニュー項目形式に変換
    const dynamicMenuItems: SidebarMenuItemType[] | null = dynamicLinks
    ? dynamicLinks.map(link => ({
        type: 'item',
        key: link._id,
        icon: link.iconUrl || '/default-link-icon.png', // アイコンURLを直接渡す
        text: link.title,
        path: link.url,
        isExternal: true, // 外部リンクであることを示す
      }))
    : null; // dynamicLinksがundefinedの場合はnull
  */

  // メニュー項目クリックハンドラを共通化
  const handleMenuItemClick = (key: string) => {
    if (key === 'admin') {
      // ログイン時に現在のパスをcallbackUrlとして渡す
      router.push(`/admin?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (key === 'logout') {
      // 現在のオリジン (プロトコル + ホスト名 + ポート) を callbackUrl に設定
      signOut({ callbackUrl: window.location.origin }); // NextAuth.jsのsignOutを使用し、ログアウト後にトップページへリダイレクト
    }
  };

  // オーバーレイメニューの項目クリック時にメニューを閉じるためのハンドラ
  const handleOverlayItemClick = (key: string) => {
    handleMenuItemClick(key);
    onMenuToggleClick(); // メニューを閉じる
  };

  // スワイプ開始時の処理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // スワイプ終了時の処理
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 50; // スワイプと判定する閾値（ピクセル）

    if (swipeDistance > swipeThreshold && !isMenuOpen) {
      // 右にスワイプしてメニューが閉じている場合、メニューを開く
      onMenuToggleClick();
    } else if (swipeDistance < -swipeThreshold && isMenuOpen) {
      // 左にスワイプしてメニューが開いている場合、メニューを閉じる
      onMenuToggleClick();
    }
  };

  return (
    <>
      {/* 大中画面用サイドバー (md以上で表示) */}
      <div
        className={`hidden md:flex lg:flex flex-col fixed left-0 top-[var(--header-height)] h-[calc(100dvh-var(--header-height))] bg-white flex-shrink-0 z-12 transition-all duration-[var(--sidebar-animation-duration)] ease-in-out
          ${isMenuOpen ? 'lg:w-[var(--sidebar-width-open)] md:w-[var(--sidebar-width-closed)]' : 'w-[var(--sidebar-width-closed)]'}`}
      >

        {/* メニュー項目をループでレンダリングするエリア */}
        <div
          className="absolute top-0 bottom-[var(--header-height)] left-0 w-full overflow-y-auto overflow-x-hidden flex flex-col items-start"
        >
          <SidebarContent
            menuItems={staticMenuItems}
            hoveredItem={hoveredItem}
            onMouseEnter={setHoveredItem}
            onMouseLeave={setHoveredItem}
            handleMenuItemClick={handleMenuItemClick}
            isMenuOpenForContent={isMenuOpen && (isLargeScreen !== false)}
            isOverlay={false}
          />
          {/* <SidebarContent
            menuItems={dynamicMenuItems}
            hoveredItem={hoveredItem}
            onMouseEnter={setHoveredItem}
            onMouseLeave={setHoveredItem}
            handleMenuItemClick={handleMenuItemClick}
            isMenuOpenForContent={isMenuOpen && (isLargeScreen !== false)}
            isOverlay={false}
          /> */}
          {/* 伸縮して空白を埋めるクリック可能な領域 */}
          <div
            className="flex-grow w-full cursor-pointer"
            onClick={handleSidebarToggle}
          />
        </div>

        {/* ログイン/ログアウトボタンをサイドバー全体の最下部に追加 */}
        <div className="w-full h-[60px] bg-white flex items-center z-10 mt-auto">
          {
            renderAuthMenuItem(isMenuOpen && (isLargeScreen !== false), 'desktop', false)
          }
        </div>
      </div>

      {/* 小〜中画面用オーバーレイメニュー */}
      {/* <div className="lg:hidden"> */}
      {isLargeScreen !== null && !isLargeScreen && (
        <>
          {/* オーバーレイメニュー背景*/}
          <div
            className={`fixed inset-0 z-14 bg-black/50 transition-opacity duration-[var(--sidebar-animation-duration)] ease-in-out ${isOverlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onMenuToggleClick}
          />
          <div
            className={`fixed top-0 left-0 h-[100dvh] w-[var(--sidebar-width-open)] bg-white z-16 flex flex-col items-start transition-transform duration-[var(--sidebar-animation-duration)] ease-in-out
              ${isOverlayVisible ? 'translate-x-0' : '-translate-x-full'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
              <SidebarHeader onMenuToggleClick={onMenuToggleClick} />

              {/* メニュー項目をループでレンダリング（小画面用） */}
              <div
                className="flex-grow overflow-y-auto w-full flex flex-col"
              >
                <SidebarContent
                  menuItems={staticMenuItems}
                  hoveredItem={hoveredItem}
                  onMouseEnter={setHoveredItem}
                  onMouseLeave={setHoveredItem}
                  handleMenuItemClick={handleOverlayItemClick}
                  isMenuOpenForContent={true}
                  isOverlay={true}
                />
                {/* <SidebarContent
                  menuItems={dynamicMenuItems}
                  hoveredItem={hoveredItem}
                  onMouseEnter={setHoveredItem}
                  onMouseLeave={setHoveredItem}
                  handleMenuItemClick={handleOverlayItemClick}
                  isMenuOpenForContent={true}
                  isOverlay={true}
                /> */}
                {/* 伸縮して空白を埋めるクリック可能な領域 */}
                <div
                  className="flex-grow w-full cursor-pointer"
                  onClick={handleSidebarToggle}
                />
              </div>
              {/* ログイン/ログアウトボタンをサイドメニュー最下部に追加（小画面用） */}
              <div className="w-full h-[60px] flex-shrink-0 bg-white mt-auto flex items-center">
                {
                  renderAuthMenuItem(true, 'mobile', true)
                }
            </div>
          </div>
        </>
      )}
    </>
  );
}