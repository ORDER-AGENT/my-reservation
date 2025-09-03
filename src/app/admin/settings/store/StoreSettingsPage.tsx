'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import withAuthorization from '@/components/auth/withAuthorization';
import { Skeleton } from '@/components/ui/skeleton';

// 曜日の定義
const daysOfWeek = [
  { id: 1, label: '月曜日' },
  { id: 2, label: '火曜日' },
  { id: 3, label: '水曜日' },
  { id: 4, label: '木曜日' },
  { id: 5, label: '金曜日' },
  { id: 6, label: '土曜日' },
  { id: 0, label: '日曜日' },
] as const;

// スケルトンコンポーネント
const StoreSettingsSkeleton = () => (
  <div className="p-4">
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <div className="mb-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// フォームのバリデーションスキーマ
const formSchema = z.object({
  name: z.string().min(1, { message: '店舗名は必須です' }),
  address: z.string().min(1, { message: '住所は必須です' }),
  phone: z.string().min(1, { message: '電話番号は必須です' }),
  openingHours: z.array(
    z.object({
      dayOfWeek: z.number(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  ).optional(),
  enabledDays: z.array(z.number()).optional(),
});

// ページコンポーネント本体
const StoreSettingsPage = () => {
  // Convexから店舗情報を取得 (認証されている場合のみ)
  const store =useQuery(api.stores.getStore);
  // Convexのmutationを呼び出すためのフック
  const createOrUpdateStore = useMutation(api.stores.createOrUpdateStore);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      openingHours: daysOfWeek.map(day => ({ dayOfWeek: day.id, startTime: '09:00', endTime: '18:00' })),
      enabledDays: daysOfWeek.map(day => day.id),
    },
  });

  // 店舗情報が読み込まれたらフォームに値をセット
  useEffect(() => {
    // storeがnull（未作成）の場合も考慮
    if (store) { // storeがundefinedでない場合にのみ実行
      form.reset({
        name: store.name,
        address: store.address,
        phone: store.phone,
        openingHours: store.openingHours,
        enabledDays: store.openingHours.map(oh => oh.dayOfWeek),
      });
    }
  }, [store, form]);

  // storeがundefinedの場合はローディング中とみなし、スケルトンを表示
  if (store === undefined) {
    return <StoreSettingsSkeleton />;
  }

  // フォーム送信時の処理
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const openingHours = values.openingHours?.filter(oh => values.enabledDays?.includes(oh.dayOfWeek));

      await createOrUpdateStore({
        name: values.name,
        address: values.address,
        phone: values.phone,
        openingHours: openingHours || [],
      });
      toast.success('店舗情報が保存されました');
    } catch (error) {
      console.error(error);
      toast.error('店舗情報の保存に失敗しました');
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>店舗情報設定</CardTitle>
          <CardDescription>店舗の基本情報と営業時間を設定します。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>店舗名</FormLabel>
                    <FormControl>
                      <Input placeholder="例: Gemini Salon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>住所</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 東京都渋谷区..." {...field} />
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
                      <Input placeholder="例: 03-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabledDays"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">営業時間</FormLabel>
                      <FormDescription>
                        営業する曜日を選択し、営業時間を入力してください。
                      </FormDescription>
                    </div>
                    {daysOfWeek.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="enabledDays"
                        render={({ field }) => {
                          const dayIndex = form.getValues('openingHours')?.findIndex(d => d.dayOfWeek === day.id) ?? -1;
                          return (
                            <div className="flex items-center space-x-4 p-2 rounded-md hover:bg-muted">
                              <Checkbox
                                checked={field.value?.includes(day.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), day.id])
                                    : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== day.id
                                      )
                                    );
                                }}
                              />
                              <FormLabel className="flex-1 font-normal">{day.label}</FormLabel>
                              <div className="flex items-center space-x-2">
                                <FormField
                                  control={form.control}
                                  name={`openingHours.${dayIndex}.startTime`}
                                  render={({ field: timeField }) => (
                                    <Input
                                      type="time"
                                      {...timeField}
                                      disabled={!field.value?.includes(day.id)}
                                    />
                                  )}
                                />
                                <span>-</span>
                                <FormField
                                  control={form.control}
                                  name={`openingHours.${dayIndex}.endTime`}
                                  render={({ field: timeField }) => (
                                    <Input
                                      type="time"
                                      {...timeField}
                                      disabled={!field.value?.includes(day.id)}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">保存する</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// HOCでラップし、初期化チェックを必須にする
export default withAuthorization(
  StoreSettingsPage,
  { requireInitialization: true, skeletonComponent: StoreSettingsSkeleton }
);