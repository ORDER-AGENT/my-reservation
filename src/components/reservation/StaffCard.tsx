'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Staff } from '@/types/data';

interface StaffCardProps {
  staff: Staff;
  isSelected: boolean;
  onSelect: (staff: Staff) => void;
}

export default function StaffCard({ staff, isSelected, onSelect }: StaffCardProps) {
  return (
    <Card
      key={staff.id}
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        isSelected ? 'border-primary ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(staff)}
    >
      <CardHeader>
        <CardTitle>{staff.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {staff.avatarUrl && (
          <img src={staff.avatarUrl} alt={staff.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
        )}
      </CardContent>
    </Card>
  );
}
