import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ServiceMenu, Staff, CustomerInfo } from '@/types/data';

export type ReservationTotals = {
  price: number;
  duration: number;
};

// 選択されたメニューを管理するatom
export const selectedMenusAtom = atomWithStorage<ServiceMenu[]>('selectedMenus', []);

// 選択されたスタッフを管理するatom
export const selectedStaffAtom = atomWithStorage<Staff | null>('selectedStaff', null);

// 選択された日時を管理するatom
const dateStorage = {
  getItem: (key: string) => {
    const str = localStorage.getItem(key);
    return str === null ? null : new Date(str);
  },
  setItem: (key: string, newValue: Date | null) => {
    localStorage.setItem(key, newValue ? newValue.toISOString() : 'null');
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};
export const selectedDateTimeAtom = atomWithStorage<Date | null>(
  'selectedDateTime',
  null,
  dateStorage
);

// お客様情報を管理するatom
const customerInfoStorage = {
  getItem: (key: string) => {
    const str = localStorage.getItem(key);
    if (str === null) {
      return null;
    }
    return str === 'null' ? null : JSON.parse(str);
  },
  setItem: (key: string, newValue: CustomerInfo | null) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};
export const customerInfoAtom = atomWithStorage<CustomerInfo | null>(
  'customerInfo',
  null,
  customerInfoStorage
);

// 復元確認済みフラグを管理するatom
export const hasCheckedForRestoreAtom = atom(false);

// 予約状態をリセットするための書き込み専用atom
export const resetReservationAtom = atom(
  null, // 読み取りはしないのでnull
  (get, set) => {
    set(selectedMenusAtom, []);
    set(selectedStaffAtom, null);
    set(selectedDateTimeAtom, null);
    set(customerInfoAtom, null);
    set(hasCheckedForRestoreAtom, false);
  }
);

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

// 予約可能な時間枠を管理するatom
export const availableSlotsAtom = atom<Record<string, string[]> | undefined>(undefined);
