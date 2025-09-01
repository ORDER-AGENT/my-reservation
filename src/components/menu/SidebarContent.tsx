'use client';

import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';
import { SidebarMenuItemType } from '@/types/sidebar';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarContentProps {
  menuItems: SidebarMenuItemType[] | null;
  hoveredItem: string | null;
  onMouseEnter: (key: string) => void;
  onMouseLeave: (key: string | null) => void;
  handleMenuItemClick: (key: string) => void;
  isMenuOpenForContent: boolean; // コンテンツの表示/非表示を制御するisMenuOpen
  isOverlay: boolean;
}

export default function SidebarContent({
  menuItems,
  hoveredItem,
  onMouseEnter,
  onMouseLeave,
  handleMenuItemClick,
  isMenuOpenForContent,
  isOverlay,
}: SidebarContentProps) {
  const pathname = usePathname();
  
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-4">
        <Skeleton className={`rounded-full ${isMenuOpenForContent ? 'h-15 w-15' : 'h-10 w-10'}`} />
      </div>
    );
  }

  return (
    <>
      {/* メニュー項目をループでレンダリングするエリア */}
      <div className="flex flex-col w-full">
        {menuItems.map((item) => {
          if (item.type === 'divider') {
            return <div key={item.key} className="my-2 w-4/5 mx-auto border-t border-gray-200 dark:border-gray-700" />;
          }
          return (
            <SidebarMenuItem
              key={item.key}
              icon={item.icon}
              text={item.text}
              isMenuOpen={isMenuOpenForContent}
              isSelected={item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)}
              isHovered={hoveredItem === item.key}
              onMouseEnter={() => onMouseEnter(item.key)}
              onMouseLeave={() => onMouseLeave(null)}
              onClick={() => handleMenuItemClick(item.key)}
              path={item.path}
              isExternal={item.isExternal ?? false}
              isOverlay={isOverlay}
            />
          );
        })}
      </div>
    </>
  );
} 