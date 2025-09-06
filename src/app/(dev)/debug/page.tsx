'use client';

// 必要なモジュールとフックのインポート
import {
  hasCheckedForRestoreAtom,
  reservationTotalsAtom,
  resetReservationAtom,
  selectedDateTimeAtom,
  selectedStaffAtom,
  selectedMenusAtom,
  customerInfoAtom,
} from '@/atoms/reservation';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { LastReservation } from '@/types/data';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// デバッグページコンポーネントの定義
export default function DebugPage() {
  // LocalStorageから最終予約情報を取得・削除するためのフック
  const { getItem, removeItem } = useLocalStorage<LastReservation>('lastReservation');
  // LocalStorageから取得した予約情報を保持する状態
  const [reservation, setReservation] = useState<LastReservation | null>(null);

  // Jotai Atomの値を取得
  const selectedMenus = useAtomValue(selectedMenusAtom);
  const selectedStaff = useAtomValue(selectedStaffAtom);
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const reservationTotals = useAtomValue(reservationTotalsAtom);
  const hasCheckedForRestore = useAtomValue(hasCheckedForRestoreAtom);
  const customerInfo = useAtomValue(customerInfoAtom);
  // Jotai Atomをリセットするための関数
  const resetAtoms = useSetAtom(resetReservationAtom);

  // Next-Authセッションデータの取得
  const { data: session } = useSession();
  // Convexからユーザー情報を取得
  const user = useQuery(api.users.getUserByEmail, session?.user.email ? { email: session.user.email } : 'skip');

  // コンポーネントのマウント時にLocalStorageから予約情報を読み込む
  useEffect(() => {
    setReservation(getItem());
  }, [getItem]);

  // LocalStorageの'lastReservation'をクリアするハンドラー
  const handleClearLocalStorage = () => {
    removeItem();
    setReservation(null); // 画面表示も更新
  };

  // LocalStorageのデータを再読み込みするハンドラー
  const handleRefresh = () => {
    setReservation(getItem());
  };

  // 全てのJotai Atomをリセットするハンドラー
  const handleResetAtoms = () => {
    resetAtoms();
  };

  // UIのレンダリング
  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* 現在のユーザー情報表示セクション */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Debug: Current User</h1>
        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold">Session Data</h2>
          <pre className="text-sm whitespace-pre-wrap break-all">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        <div className="p-4 border rounded-md bg-gray-50 mt-4">
          <h2 className="text-lg font-semibold">User Document (from Convex)</h2>
          <pre className="text-sm whitespace-pre-wrap break-all">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>

      {/* Jotai Atomの状態表示セクション */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Debug: Atom State</h1>
        <div className="space-x-2 mb-4">
          <Button variant="destructive" onClick={handleResetAtoms}>
            Reset All Atoms
          </Button>
        </div>
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold">selectedMenus</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(selectedMenus, null, 2)}
            </pre>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold">selectedStaff</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(selectedStaff, null, 2)}
            </pre>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold">selectedDateTime</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {selectedDateTime ? selectedDateTime.toISOString() : 'null'}
            </pre>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold">reservationTotals</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(reservationTotals, null, 2)}
            </pre>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold">hasCheckedForRestore</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(hasCheckedForRestore, null, 2)}
            </pre>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold">customerInfo</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(customerInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* LocalStorage情報表示セクション */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Debug: LocalStorage</h1>
        <div className="space-x-2 mb-4">
          <Button onClick={handleRefresh}>Refresh</Button>
          <Button variant="destructive" onClick={handleClearLocalStorage}>
            Clear lastReservation
          </Button>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold">lastReservation</h2>
          <pre className="text-sm whitespace-pre-wrap break-all">
            {reservation ? JSON.stringify(reservation, null, 2) : 'No data found.'}
          </pre>
        </div>
      </div>
    </div>
  );
}

