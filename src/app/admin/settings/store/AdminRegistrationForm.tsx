'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// フォームのバリデーションスキーマ
const formSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上で入力してください' }),
});

export default function AdminRegistrationForm() {
  const router = useRouter();
  const createUser = useMutation(api.auth.createUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // フォーム送信時の処理
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createUser({
        email: values.email,
        password: values.password,
        role: 'admin',
      });
      toast.success('管理者アカウントを作成しました。作成したアカウントでログインしてください。');
      router.push('/auth/signin');
    } catch (error) {
      console.error(error);
      toast.error('アカウントの作成に失敗しました。');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ようこそ！</CardTitle>
          <CardDescription>
            システムを初期化します。最初の管理者アカウントを登録してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">管理者として登録する</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
