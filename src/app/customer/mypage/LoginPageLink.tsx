'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LoginPageLink = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">アカウントをお持ちの方はこちらからログインしてください。</p>
        <Link href="/auth/signin" passHref>
          <Button>ログインページへ</Button>
        </Link>
      </CardContent>
    </Card>
  );
};
