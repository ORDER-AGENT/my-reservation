'use client';

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
import { api } from '../../../../convex/_generated/api';

export default function DebugPage() {
  const { getItem, removeItem } = useLocalStorage<LastReservation>('lastReservation');
  const [reservation, setReservation] = useState<LastReservation | null>(null);

  // Atom values
  const selectedMenus = useAtomValue(selectedMenusAtom);
  const selectedStaff = useAtomValue(selectedStaffAtom);
  const selectedDateTime = useAtomValue(selectedDateTimeAtom);
  const reservationTotals = useAtomValue(reservationTotalsAtom);
  const hasCheckedForRestore = useAtomValue(hasCheckedForRestoreAtom);
  const customerInfo = useAtomValue(customerInfoAtom);
  const resetAtoms = useSetAtom(resetReservationAtom);

  const { data: session } = useSession();
  const user = useQuery(api.users.getUserByEmail, session?.user.email ? { email: session.user.email } : 'skip');

  useEffect(() => {
    setReservation(getItem());
  }, [getItem]);

  const handleClearLocalStorage = () => {
    removeItem();
    setReservation(null); // 画面表示も更新
  };

  const handleRefresh = () => {
    setReservation(getItem());
  };

  const handleResetAtoms = () => {
    resetAtoms();
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
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

