'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { hasCheckedForRestoreAtom, selectedMenusAtom, selectedStaffAtom } from '@/atoms/reservation';
import type { ServiceMenu, LastReservation } from '@/types/data';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function MenuStep() {
  const [selectedMenus, setSelectedMenus] = useAtom(selectedMenusAtom);
  const [, setSelectedStaff] = useAtom(selectedStaffAtom);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [lastReservation, setLastReservation] =
    useState<LastReservation | null>(null);
  const { getItem } = useLocalStorage<LastReservation>('lastReservation');
  const [hasCheckedForRestore, setHasCheckedForRestore] = useAtom(hasCheckedForRestoreAtom);
  
  // セッションからではなく、直接店舗情報を取得する
  const store = useQuery(api.stores.getFirst);
  const storeId = store?._id;

  const serviceMenus = useQuery(api.services.get, storeId ? { storeId } : 'skip');

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
  }, [selectedMenus.length, getItem, hasCheckedForRestore, setHasCheckedForRestore]);

  const handleRestore = () => {
    if (lastReservation) {
      setSelectedMenus(lastReservation.menus);
      setSelectedStaff(lastReservation.staff);
    }
    setShowRestoreDialog(false);
  };

  const handleDismiss = () => {
    setShowRestoreDialog(false);
  };

  const handleToggleMenu = (menu: ServiceMenu) => {
    setSelectedMenus((prevSelected) => {
      const isSelected = prevSelected.find((m) => m._id === menu._id);
      if (isSelected) {
        return prevSelected.filter((m) => m._id !== menu._id);
      } else {
        return [...prevSelected, menu];
      }
    });
  };

  if (!serviceMenus) {
    return (
      <div className="grid grid-cols-1 gap-4 mt-4 px-2 md:px-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="gap-1 py-3 flex flex-col border rounded-lg">
            <div className="flex-grow flex flex-row gap-4 items-start justify-between px-6 py-4">
              <div className="flex flex-row gap-4 items-start">
                <Skeleton className="w-16 h-16 rounded-md" />
                <div>
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 mt-4 px-2 md:px-4">
        {serviceMenus.map((menu) => {
          const isSelected = !!selectedMenus.find((m) => m._id === menu._id);
          return (
            <ServiceMenuCard
              key={menu._id}
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
