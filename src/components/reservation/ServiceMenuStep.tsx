'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { hasCheckedForRestoreAtom, selectedMenusAtom, selectedStaffAtom } from '@/atoms/reservation';
import { serviceMenus } from '@/mocks/data';
import type { ServiceMenu, LastReservation } from '@/types/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import useLocalStorage from '@/hooks/useLocalStorage';
import ServiceMenuCard from './ServiceMenuCard';

export default function MenuStep() {
  const [selectedMenus, setSelectedMenus] = useAtom(selectedMenusAtom);
  const [, setSelectedStaff] = useAtom(selectedStaffAtom);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [lastReservation, setLastReservation] =
    useState<LastReservation | null>(null);
  const { getItem, removeItem } = useLocalStorage<LastReservation>('lastReservation');
  const [hasCheckedForRestore, setHasCheckedForRestore] = useAtom(hasCheckedForRestoreAtom);
  useEffect(() => {
    // すでに何らかのメニューが選択されている場合や、すでに復元を確認済みの場合は何もしない
    if (selectedMenus.length > 0 || hasCheckedForRestore) {
      return;
    }

    const storedState = getItem();
    if (storedState) {
      if (storedState.menus?.length > 0 || storedState.staff) {
        setLastReservation(storedState);
        setShowRestoreDialog(true);
      }
    }
    // これで、このeffectは実質的に一度しか実行されなくなる
    setHasCheckedForRestore(true);
  }, [selectedMenus.length, getItem, hasCheckedForRestore]);

  const handleRestore = () => {
    if (lastReservation) {
      setSelectedMenus(lastReservation.menus);
      setSelectedStaff(lastReservation.staff);
    }
    setShowRestoreDialog(false);
  };

  const handleDismiss = () => {
    //removeItem();
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
      <div className="grid grid-cols-1 gap-4 mt-4 px-2 md:px-4">
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
