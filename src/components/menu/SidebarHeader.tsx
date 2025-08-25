'use client';

import React from 'react';
import MenuToggleButton from './MenuToggleButton';
import AppLogo from '@/components/AppLogo';

interface SidebarHeaderProps {
  onMenuToggleClick: () => void;
}

export default function SidebarHeader({ onMenuToggleClick }: SidebarHeaderProps) {
  return (
    <div className="w-full h-[60px] flex items-center flex-shrink-0 bg-white z-10">
      <MenuToggleButton onClick={onMenuToggleClick} />
      <AppLogo />
    </div>
  );
} 