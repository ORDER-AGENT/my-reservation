'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmFooterProps {
  onBackClick: () => void;
}

export default function ConfirmFooter({ onBackClick }: ConfirmFooterProps) {
  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex justify-start"> 
        <Button
          variant="outline"
          onClick={onBackClick}
        >
          戻る
        </Button>
      </div>
    </div>
  );
}
