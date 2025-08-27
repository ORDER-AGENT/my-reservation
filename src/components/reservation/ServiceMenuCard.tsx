'use client';

import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
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
      className={`gap-1 flex flex-col cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onToggle(menu)}
    >
      <CardHeader>
        <CardTitle>{menu.name}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-row gap-4 items-start">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={menu.imageUrl}
            alt={menu.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{menu.description}</p>
          <span>約{menu.duration}分 / ¥{menu.price.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start items-center mt-auto pt-2">
        <Button variant={isSelected ? 'default' : 'outline'} className="w-full">
          {isSelected ? '選択中' : '選択する'}
        </Button>
      </CardFooter>
    </Card>
  );
}
