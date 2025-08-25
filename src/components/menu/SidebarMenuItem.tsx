'use client';

import React from 'react';
import { IconType } from 'react-icons';
import Image from 'next/image';
import Link from 'next/link';

// SidebarMenuItemコンポーネントのPropsの型定義
interface SidebarMenuItemProps {
  icon: IconType | string; // IconType または URL
  text: string; // メニュー項目テキスト
  isMenuOpen: boolean; // メニューが開いているか
  isSelected: boolean; // 選択されているか
  isHovered: boolean; // ホバーされているか
  onMouseEnter: () => void; // マウスエンター時のハンドラ
  onMouseLeave: () => void; // マウスリーブ時のハンドラ
  onClick: () => void; // クリック時のハンドラ
  path: string; // リンク先パス
  isExternal: boolean; // 外部リンクかどうかのフラグ
  isOverlay: boolean;
}

export default function SidebarMenuItem({
  icon: Icon,
  text,
  isMenuOpen,
  isSelected,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  path,
  isExternal,
  isOverlay,
}: SidebarMenuItemProps) {
  
  // メニュー項目全体のベーススタイル
  const itemBaseClasses = `
    flex items-center justify-start pl-5 relative overflow-hidden h-[40px]
    transition-all duration-[var(--sidebar-animation-duration)] ease-in-out
    ${isSelected ? 'text-primary' : 'text-secondary hover:text-accent-foreground'} // ホバー時のテキスト色を追加
  `;


  // アイコン部分のスタイル
  const iconClasses = `
    flex-shrink-0 flex items-center justify-center size-6 z-10 mr-2
  `;

  // テキスト部分のスタイル
  const textClasses = `
    text-base overflow-hidden transition-all duration-[var(--sidebar-animation-duration)] ease-in-out whitespace-nowrap
    ${isMenuOpen ? `${!isOverlay ? 'lg:opacity-100 md:opacity-0' : 'opacity-100'}` : 'opacity-0 pointer-events-none'}
  `;

  const handleClick = () => {
    onClick(); // isExternal の条件分岐を削除し、onClickのみを呼び出す
  };

  const commonProps = {
    className: `${itemBaseClasses} ${isHovered ? 'bg-gray-100' : ''}
                  flex items-center justify-center p-0 rounded-md
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 // フォーカススタイル
                  disabled:pointer-events-none disabled:opacity-50 // 無効化スタイル
                  relative // ホバー擬似要素のためにrelativeを追加
                  `,
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: handleClick,
  };

  // <a>と<Link>タグの子要素を共通化
  const childrenContent = (
    <>
      {isSelected && (
        <div className="absolute inset-y-0 left-0 w-[60px] bg-gradient-to-r from-[var(--primary-gradient)]/20 to-transparent" />
      )}
      <div className={iconClasses}>
        {typeof Icon === 'string' ? (
          <Image
            src={Icon || '/default-link-icon.png'} // Iconを使用
            alt={text}
            width={0} // 幅を指定
            height={0} // 高さを指定
            sizes="100%"
            className="w-full h-auto"
            unoptimized={true}
          />
        ) : (
          <Icon className="size-6" /> // IconTypeの場合はコンポーネントとしてレンダリング
        )}
      </div>
      <span className={textClasses}>{text}</span>

    </>
  );

  return (
    <>
      {isExternal ? (
        <a href={path} target="_blank" rel="noopener noreferrer" {...commonProps}>
          {childrenContent}
        </a>
      ) : (
        <Link href={path} {...commonProps}>
          {childrenContent}
        </Link>
      )}
    </>
  );
}
