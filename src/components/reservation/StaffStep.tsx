'use client';

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedStaffAtom, selectedMenusAtom } from '@/atoms/reservation';
import StaffCard from './StaffCard';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Staff } from '@/types/data';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function StaffStep() {
  const [selectedStaff, setSelectedStaff] = useAtom(selectedStaffAtom);
  const [selectedMenus] = useAtom(selectedMenusAtom);
  const router = useRouter();

  // セッションからではなく、直接店舗情報を取得する
  const store = useQuery(api.stores.getFirst);
  const storeId = store?._id;

  const staffs = useQuery(
    api.staffs.getStaffsWithUsers,
    storeId ? { storeId } : 'skip',
  );

  useEffect(() => {
    if (selectedMenus.length === 0) {
      // 前のステップでメニューが選択されていない場合は、メニュー選択に戻す
      router.replace('/customer/reservation/menu');
    }
  }, [selectedMenus, router]);

  const handleToggleStaff = (staff: Staff) => {
    setSelectedStaff((current) => (current?._id === staff._id ? null : staff));
  };

  // メニュー未選択、またはスタッフ情報ロード中の場合はスケルトンを表示
  if (selectedMenus.length === 0 || !staffs) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-2 md:px-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex flex-row gap-4 items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-2 md:px-4">
        {staffs.filter((staff) => staff !== null).map((staff) => (
          <StaffCard
            key={staff._id}
            staff={staff}
            isSelected={selectedStaff?._id === staff._id}
            onToggle={handleToggleStaff}
          />
        ))}
      </div>
    </div>
  );
}