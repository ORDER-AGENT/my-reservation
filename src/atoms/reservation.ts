import { atom } from 'jotai';
import type { ServiceMenu, Staff } from '@/types/data';

export type ReservationTotals = {
  price: number;
  duration: number;
};

// 選択されたメニューを管理するatom
export const selectedMenusAtom = atom<ServiceMenu[]>([]);

// 選択されたスタッフを管理するatom
export const selectedStaffAtom = atom<Staff | null>(null);

// 選択された日時を管理するatom
export const selectedDateTimeAtom = atom<Date | null>(null);

// 合計金額と合計時間を計算する派生atom (derived atom)
export const reservationTotalsAtom = atom<ReservationTotals>((get) => {
  const menus = get(selectedMenusAtom);
  return menus.reduce(
    (acc, menu) => {
      acc.price += menu.price;
      acc.duration += menu.duration;
      return acc;
    },
    { price: 0, duration: 0 }
  );
});
