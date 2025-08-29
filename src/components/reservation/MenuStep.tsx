'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { selectedMenusAtom, selectedStaffAtom } from '@/atoms/reservation';
import { serviceMenus } from '@/mocks/data';
import type { ServiceMenu, Staff } from '@/types/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import ServiceMenuCard from './ServiceMenuCard';

type LastReservation = {
  menus: ServiceMenu[];
  staff: Staff | null;
  timestamp: string;
};

export default function MenuStep() {
  const [selectedMenus, setSelectedMenus] = useAtom(selectedMenusAtom);
  const [, setSelectedStaff] = useAtom(selectedStaffAtom);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [lastReservation, setLastReservation] =
    useState<LastReservation | null>(null);

  useEffect(() => {
    // すでに何らかのメニューが選択されている場合（＝予約フローの途中で戻ってきた場合）は、
    // 復元ダイアログを表示しない
    if (selectedMenus.length > 0) {
      return;
    }

    const storedState = localStorage.getItem('lastReservation');
    if (storedState) {
      try {
        const parsedState: LastReservation = JSON.parse(storedState);
        if (
          parsedState.menus?.length > 0 ||
          parsedState.staff
        ) {
          setLastReservation(parsedState);
          setShowRestoreDialog(true);
        }
      } catch (error) {
        console.error('Failed to parse last reservation state from localStorage', error);
        localStorage.removeItem('lastReservation');
      }
    }
  }, []);

  const handleRestore = () => {
    if (lastReservation) {
      setSelectedMenus(lastReservation.menus);
      setSelectedStaff(lastReservation.staff);
    }
    setShowRestoreDialog(false);
  };

  const handleDismiss = () => {
    localStorage.removeItem('lastReservation');
    setShowRestoreDialog(false);
  };

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

      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>前回の予約内容の確認</DialogTitle>
            <DialogDescription>
              前回と同じ内容で予約を続けますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              メニューから予約する
            </Button>
            <Button onClick={handleRestore}>同じ内容で予約する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}