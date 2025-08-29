'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CompleteStep() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">予約が完了しました！</h1>
      <p className="text-lg text-gray-700 mb-8">ご予約ありがとうございます。詳細は後ほどメールにてご連絡いたします。</p>
      <Button onClick={() => router.push('/')}>
        トップページに戻る
      </Button>
    </div>
  );
}
