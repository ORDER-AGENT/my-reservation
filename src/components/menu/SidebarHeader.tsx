'use client';

import React from 'react';
import Image from 'next/image';
import MenuToggleButton from './MenuToggleButton';

interface SidebarHeaderProps {
  onMenuToggleClick: () => void;
}

export default function SidebarHeader({ onMenuToggleClick }: SidebarHeaderProps) {
  return (
    <div className="w-full h-[60px] flex items-center flex-shrink-0 bg-white z-10">
      <MenuToggleButton onClick={onMenuToggleClick} />
      {/* 親要素を relative にしてサイズを定義 */}
      <div className="relative w-[60px] ml-0">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={0}
          height={0}
          sizes="100%"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
} 