'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAtom } from 'jotai';
import { customerInfoAtom } from '@/atoms/reservation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CustomerInfo } from '@/types/data';
import { toast } from 'sonner';
import { useEffect, useCallback, useState } from 'react';
import { Separator } from '@/components/ui/separator';

// ゲスト入力フォームのスキーマ定義
const guestFormSchema = z.object({
  name: z.string().min(1, { message: '氏名を入力してください。' }),
  phone: z.string().min(10, { message: '有効な電話番号を入力してください。' }).max(15),
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
});

interface CustomerInfoStepProps {
  onNextClick: () => void;
}

export default function CustomerInfoStep({ onNextClick }: CustomerInfoStepProps) {
  const { data: session } = useSession();
  const [customerInfo, setCustomerInfo] = useAtom(customerInfoAtom);
  const params = useParams();
  const step = params.step;
  const [activeTab, setActiveTab] = useState('login');
  

  const form = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: customerInfo || {
      name: '',
      phone: '',
      email: '',
    },
    mode: 'onChange', // バリデーションを即座に実行するために 'onChange' モードを設定
  });

  const { isValid } = form.formState;

  function onGuestSubmit(values: z.infer<typeof guestFormSchema>) {
    setCustomerInfo(values);
    //toast.success('お客様情報を保存しました。');
    onNextClick();
  }

  const updateCustomerInfoFromSession = useCallback(() => {
    if (session?.user) {
      const sessionCustomerInfo: CustomerInfo = {
        name: session.user.name ?? '名無し',
        email: session.user.email ?? 'メールアドレス無し',
        phone: '' // セッションに電話番号はないため空文字。必要であれば入力させる。
      };
      setCustomerInfo(sessionCustomerInfo);
      //toast.success('ログイン情報を使用します。');
    }
  }, [session, setCustomerInfo]);

  const handleUseSessionInfo = () => {
    updateCustomerInfoFromSession();
    onNextClick();
  };

  useEffect(() => {
    // セッション情報があり、かつ顧客情報がまだセッション情報で初期化されていない、
    // または顧客情報のメールアドレスがセッションのメールアドレスと異なる場合のみ実行
    if (session?.user && (!customerInfo || customerInfo.email !== session.user.email)) {
      updateCustomerInfoFromSession();
    }
  }, [session, customerInfo, updateCustomerInfoFromSession]);


  if (session) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>お客様情報の確認</CardTitle>
            <CardDescription>現在、以下の情報でログインしています。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50">
              <p><strong>氏名:</strong> {session.user?.name}</p>
              <p><strong>メールアドレス:</strong> {session.user?.email}</p>
            </div>
            <p className='text-sm text-gray-600'>この情報で予約を続けますか？電話番号など、追加情報が必要な場合は、一度ログアウトしてゲストとしてご予約ください。</p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleUseSessionInfo} className="w-full">この情報で予約を進める</Button>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: `/customer/reservation/${step}` })} className="w-full">別のアカウントでログイン</Button>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">ログイン / 新規登録</TabsTrigger>
          <TabsTrigger value="guest">ゲストとして予約</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>ログイン / 新規登録</CardTitle>
              <CardDescription>
                アカウントをお持ちの方はログインしてください。予約履歴の確認などができ便利です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className='text-sm text-gray-600'>ログインまたは新規登録を行うと、入力の手間が省け、次回の予約がよりスムーズになります。</p>
              <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                      <Link href={`/auth/signin?callbackUrl=/customer/reservation/${step}`}>ログインページへ</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                      <Link href={`/auth/signup?callbackUrl=/customer/reservation/${step}`}>新規登録ページへ</Link>
                  </Button>
                  <Separator className="my-4" />
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('guest')}>ゲストとして予約</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guest">
          <Card>
            <CardHeader>
              <CardTitle>お客様情報の入力</CardTitle>
              <CardDescription>ゲストとして予約される方は、以下の情報をご入力ください。</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onGuestSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>氏名</FormLabel>
                        <FormControl>
                          <Input placeholder="山田 太郎" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>メールアドレス</FormLabel>
                        <FormControl>
                          <Input placeholder="your@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>電話番号</FormLabel>
                        <FormControl>
                          <Input placeholder="09012345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={!isValid}>この情報で予約を進める</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
  );
}
