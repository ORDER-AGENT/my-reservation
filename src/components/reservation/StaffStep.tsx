'use client';

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedStaffAtom, selectedMenusAtom } from '@/atoms/reservation';
import { staffList } from '@/mocks/data';
import StaffCard from './StaffCard';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Staff } from '@/types/data';

export default function StaffStep() {
  const [selectedStaff, setSelectedStaff] = useAtom(selectedStaffAtom);
  const [selectedMenus] = useAtom(selectedMenusAtom);
  const router = useRouter();

  useEffect(() => {
    if (selectedMenus.length === 0) {
      router.replace('/customer/reservation/menu');
    }
  }, [selectedMenus, router]);

  const handleToggleStaff = (staff: Staff) => {
    setSelectedStaff((current) => (current?.id === staff.id ? null : staff));
  };

  if (selectedMenus.length === 0) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 px-2 md:px-4">
        {staffList.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            isSelected={selectedStaff?.id === staff.id}
            onToggle={handleToggleStaff}
          />
        ))}
      </div>
    </div>
  );
}
