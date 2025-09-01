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
      key={staff.id}
      className={`gap-1 py-3 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onToggle(staff)}
    >
      <CardContent className="flex flex-row gap-4 items-center">
        <div className="relative w-16 h-16 flex-shrink-0">
          {staff.avatarUrl && (
            <Image
              src={staff.avatarUrl}
              alt={staff.name}
              fill
              sizes="64px"
              style={{ objectFit: 'cover' }}
              className="rounded-full"
            />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{staff.name}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
