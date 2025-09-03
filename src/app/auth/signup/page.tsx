'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api"; // Convex APIのインポートパスを調整

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(6, { message: "パスワードは6文字以上である必要があります。" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません。",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const createUser = useAction(api.users.createUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null); // エラーをリセット
    try {
      // Convexでユーザーを登録
      await createUser({
        email: values.email,
        password: values.password,
        role: "customer", // デフォルトでcustomerロールを付与
      });
      // 登録成功後のリダイレクト先
      const signinUrl = `/auth/signin?message=signup_success${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
      router.push(signinUrl);
    } catch (e: unknown) {
      setError((e instanceof Error) ? e.message : "ユーザー登録に失敗しました。");
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
          <CardDescription>新しいアカウントを作成してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード（確認）</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                登録
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-gray-600">
            既にアカウントをお持ちですか？{" "}
            <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl || '/')}`} className="text-blue-500 hover:underline">
              ログインはこちら
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
