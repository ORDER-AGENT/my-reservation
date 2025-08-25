'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSidebarMenuItems } from '@/data/sidebarMenuItems';
import { MenuItem, SidebarMenuItemType } from '@/types/sidebar';
import Link from 'next/link';

/*interface FooterMenuProps {
}*/

export default function FooterMenu(/*{ }: FooterMenuProps*/) {
  const pathname = usePathname();
  const { status } = useSession();

  const isLoggedIn = status === 'authenticated';
  const userRoles = isLoggedIn ? ['admin', 'guest'] : ['guest'];
  const menuItems: SidebarMenuItemType[] = getSidebarMenuItems(userRoles);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/80 border-t border-gray-200 sm:hidden flex justify-around items-center h-[var(--footer-menu-height)] z-4 shadow-lg  backdrop-blur-xl">
      {menuItems
        .filter((item): item is MenuItem => item.type === 'item' && !!item.displayInFooter)
        .map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;
          return (
            <Link href={item.path} key={item.key} className="flex flex-col flex-1 items-center justify-center p-2 text-[0.5rem] font-medium text-gray-700 hover:text-blue-600">
              <Icon className={`size-6 ${isSelected ? 'text-blue-600' : 'text-gray-500/90'}`} />
              <span className={`mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500/90'}`}>{item.text}</span>
            </Link>
          );
        })}
    </div>
  );
} 