'use client';

import React from 'react';
import Image from 'next/image';
import { useAtom } from 'jotai';
import { selectedMenusAtom } from '@/atoms/reservation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { serviceMenus } from '@/mocks/data';
import type { ServiceMenu } from '@/mocks/data';

export default function MenuStep() {
  const [selectedMenus, setSelectedMenus] = useAtom(selectedMenusAtom);

  const handleToggleMenu = (menu: ServiceMenu) => {
    setSelectedMenus((prevSelected) => {
      const isSelected = prevSelected.find((m) => m.id === menu.id);
      if (isSelected) {
        return prevSelected.filter((m) => m.id !== menu.id);
      } else {
        return [...prevSelected, menu];
      }
    });
  };

  return (
    <>
      {/*
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        メニュー選択
      </h1>
      */}
      
      <div className="grid grid-cols-1 gap-6 mt-2">
        {serviceMenus.map((menu) => {
          const isSelected = !!selectedMenus.find((m) => m.id === menu.id);
          return (
            <Card 
              key={menu.id} 
              className={`gap-1 flex flex-col cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleToggleMenu(menu)}
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
        })}
      </div>
    </>
  );
}
