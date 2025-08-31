'use client';

import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaCheck } from "react-icons/fa";
import type { ServiceMenu } from '@/types/data';

interface ServiceMenuCardProps {
  menu: ServiceMenu;
  isSelected: boolean;
  onToggle: (menu: ServiceMenu) => void;
}

export default function ServiceMenuCard({ menu, isSelected, onToggle }: ServiceMenuCardProps) {
  return (
    <Card 
      key={menu.id} 
      className={`gap-1 py-3 flex flex-col cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onToggle(menu)}
    >
      <CardContent className="flex-grow flex flex-row gap-4 items-start justify-between">
        <div className="flex flex-row gap-4 items-start">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={menu.imageUrl}
              alt={menu.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          <div>
            <p className="text-sm">{menu.description}</p>
            <span className="text-muted-foreground">約{menu.duration}分 / ¥{menu.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="w-6 h-6 flex items-center justify-center">
          <FaCheck
            className={`text-xl ${
              isSelected ? 'text-primary' : 'text-gray-300'
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
