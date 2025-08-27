'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { selectedMenusAtom } from '@/atoms/reservation';
import { serviceMenus } from '@/mocks/data';
import type { ServiceMenu } from '@/types/data';

import ServiceMenuCard from './ServiceMenuCard';

export default function MenuStep() {
  const [selectedMenus, setSelectedMenus] = useAtom(selectedMenusAtom);

  const handleToggleMenu = (menu: ServiceMenu) => {
    setSelectedMenus((prevSelected) => {
      const isSelected = prevSelected.find((m) => m.id === menu.id);
      if (isSelected) {
        return prevSelected.filter((m) => m.id !== menu.id);
      } else {
        return [...prevSelected, menu];
      }
    });
  };

  return (
    <>
      {/*
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        メニュー選択
      </h1>
      */}
      
      <div className="grid grid-cols-1 gap-4 mt-2">
        {serviceMenus.map((menu) => {
          const isSelected = !!selectedMenus.find((m) => m.id === menu.id);
          return (
            <ServiceMenuCard
              key={menu.id}
              menu={menu}
              isSelected={isSelected}
              onToggle={handleToggleMenu}
            />
          );
        })}
      </div>
    </>
  );
}
