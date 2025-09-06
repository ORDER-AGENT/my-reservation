'use client';

import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { Staff } from '@/types/data';

interface StaffCardProps {
  staff: Staff;
  isSelected: boolean;
  onToggle: (staff: Staff) => void;
}

export default function StaffCard({ staff, isSelected, onToggle }: StaffCardProps) {
  return (
    <Card
      key={staff._id}
      className={`gap-1 py-3 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onToggle(staff)}
    >
      <CardContent className="flex flex-row gap-4 items-center">
        <div className="relative w-16 h-16 flex-shrink-0">
          {staff.imageUrl ? (
            <Image
              src={staff.imageUrl}
              alt={staff.user.name ?? ""}
              width={64}
              height={64}
              className="rounded-full object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}

        </div>
        <div>
          <h3 className="text-lg font-semibold">{staff.user.name}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
