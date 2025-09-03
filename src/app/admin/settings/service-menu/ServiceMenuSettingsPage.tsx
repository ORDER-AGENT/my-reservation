'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { useAppSession } from '@/hooks/useAppSession';
import { useEffect, useState, useMemo } from 'react';
import ContentLayout from '@/components/layout/ContentLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import withAuthorization from '@/components/auth/withAuthorization';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/types/user';

// サービスメニューフォームのスキーマ定義
const serviceMenuFormSchema = z.object({
  name: z.string().min(1, { message: 'サービスメニュー名を入力してください。' }),
  description: z.string().optional(),
  price: z.number().min(0, { message: '価格は0以上である必要があります。' }),
  duration: z.number().min(1, { message: '所要時間は1分以上である必要があります。' }),
  category: z.string().min(1, { message: 'カテゴリを選択してください。' }),
  isActive: z.boolean(),
});

type ServiceMenuFormValues = z.infer<typeof serviceMenuFormSchema>;

// スケルトンコンポーネント
const ServiceMenuSettingsSkeleton = () => (
  <ContentLayout>
    <Card className="w-full max-w-2xl mx-auto mb-8">
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
                <Skeleton className="h-4 w-32 mt-1" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </ContentLayout>
);

// ページコンポーネント本体
const ServiceMenuSettingsPage = () => {
  const { session } = useAppSession();
  const storeId = session?.user.storeId as Id<'stores'> | undefined;
  const createServiceMenu = useMutation(api.services.create);
  const updateServiceMenu = useMutation(api.services.update);
  const serviceMenus = useQuery(api.services.get, storeId ? { storeId } : 'skip');

  const [editingServiceMenuId, setEditingServiceMenuId] = useState<Id<'services'> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  useEffect(() => {
    if (serviceMenus) {
      const categories = new Set(serviceMenus.map(menu => menu.category));
      setUniqueCategories(Array.from(categories));
    }
  }, [serviceMenus]);

  const handleAddCategory = () => {
    const trimmedCategoryName = newCategoryName.trim();
    if (trimmedCategoryName && !uniqueCategories.includes(trimmedCategoryName)) {
      setUniqueCategories(prev => [...prev, trimmedCategoryName]);
      form.setValue('category', trimmedCategoryName);
      setNewCategoryName('');
    }
  };

  const form = useForm<ServiceMenuFormValues>({
    resolver: zodResolver(serviceMenuFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 60,
      category: '',
      isActive: true,
    } satisfies ServiceMenuFormValues,
  });

  useEffect(() => {
    if (editingServiceMenuId && serviceMenus) {
      const editingMenu = serviceMenus.find(menu => menu._id === editingServiceMenuId);
      if (editingMenu) {
        form.reset({
          name: editingMenu.name,
          description: editingMenu.description,
          price: editingMenu.price,
          duration: editingMenu.duration,
          category: editingMenu.category,
          isActive: editingMenu.isActive,
        } satisfies ServiceMenuFormValues);
      }
    }
  }, [editingServiceMenuId, serviceMenus, form]);

  async function onSubmit(values: ServiceMenuFormValues) {
    if (!storeId) {
      toast.error('店舗情報が取得できませんでした。');
      return;
    }

    try {
      if (editingServiceMenuId) {
        await updateServiceMenu({
          id: editingServiceMenuId,
          storeId,
          ...values,
        });
        toast.success('サービスメニューを更新しました。');
      } else {
        await createServiceMenu({
          storeId,
          ...values,
        });
        toast.success('新しいサービスメニューを登録しました。');
      }
      form.reset();
      setEditingServiceMenuId(null);
    } catch (error) {
      console.error('サービスメニューの登録/更新に失敗しました:', error);
      toast.error('サービスメニューの登録/更新に失敗しました。');
    }
  }

  const handleEdit = (menuId: Id<'services'>) => {
    setEditingServiceMenuId(menuId);
  };

  const handleCancelEdit = () => {
    setEditingServiceMenuId(null);
    form.reset();
  };

  return (
    <ContentLayout>
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>{editingServiceMenuId ? 'サービスメニュー編集' : '新しいサービスメニューを登録'}</CardTitle>
          <CardDescription>新しいサービスメニューを追加したり、既存のメニューを編集できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サービスメニュー名</FormLabel>
                    <FormControl>
                      <Input placeholder="例: カット & カラー" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明 (任意)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="例: 最新のトレンドを取り入れたカットと、お客様に似合うカラーリングを提案します。" {...field} />
                    </FormControl>
                    <FormDescription>サービスの詳細を記述します。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>価格 (円)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所要時間 (分)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>既存のカテゴリから選択するか、新しいカテゴリを入力してください。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="新しいカテゴリ名"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  カテゴリを追加
                </Button>
              </div>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>公開する</FormLabel>
                      <FormDescription>
                        このサービスメニューを顧客に表示するかどうかを設定します。
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {editingServiceMenuId ? 'サービスメニューを更新' : 'サービスメニューを登録'}
                </Button>
                {editingServiceMenuId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full">
                    キャンセル
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>登録済みサービスメニュー</CardTitle>
          <CardDescription>現在登録されているサービスメニューの一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          {serviceMenus && serviceMenus.length > 0 ? (
            <ul className="space-y-4">
              {serviceMenus.map(menu => (
                <li key={menu._id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h3 className="font-semibold">{menu.name} ({menu.category})</h3>
                    <p className="text-sm text-gray-600">{menu.description}</p>
                    <p className="text-sm text-gray-600">{menu.price}円 / {menu.duration}分</p>
                    <p className="text-sm text-gray-600">{menu.isActive ? '公開中' : '非公開'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(menu._id)}>編集</Button>
                    {/* 削除機能は後で追加 */}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>登録されているサービスメニューはありません。</p>
          )}
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

// HOCでラップし、管理者権限を必須にする
export default withAuthorization(
  ServiceMenuSettingsPage,
  { skeletonComponent: ServiceMenuSettingsSkeleton }
);