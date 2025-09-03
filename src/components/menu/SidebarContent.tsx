'use client';

import React, { useState } from 'react';
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
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  const handleSubMenuToggle = (key: string) => {
    setOpenSubMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-4">
        <Skeleton className={`rounded-full ${isMenuOpenForContent ? 'h-15 w-15' : 'h-10 w-10'}`} />
      </div>
    );
  }

  const renderMenuItems = (items: SidebarMenuItemType[], isSubMenu = false) => {
    return items.map((item) => {
      if (item.type === 'divider') {
        return <div key={item.key} className="my-2 w-4/5 mx-auto border-t border-gray-200 dark:border-gray-700" />;
      }

      const isSubMenuOpen = openSubMenus.includes(item.key);
      const isSelected = item.path === '/' ? pathname === '/' : item.path ? pathname.startsWith(item.path) : false;

      return (
        <React.Fragment key={item.key}>
          <SidebarMenuItem
            item={item}
            isMenuOpen={isMenuOpenForContent}
            isSelected={isSelected}
            isHovered={hoveredItem === item.key}
            onMouseEnter={() => onMouseEnter(item.key)}
            onMouseLeave={() => onMouseLeave(null)}
            onClick={() => {
              if (item.children) {
                handleSubMenuToggle(item.key);
              } else {
                handleMenuItemClick(item.key);
              }
            }}
            isOverlay={isOverlay}
            isSubMenuOpen={isSubMenuOpen}
          />
          {item.children && isSubMenuOpen && isMenuOpenForContent && (
            <div className="pl-4">
              {renderMenuItems(item.children, true)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* メニュー項目をループでレンダリングするエリア */}
      <div className="flex flex-col w-full">
        {renderMenuItems(menuItems)}
      </div>
    </>
  );
} 