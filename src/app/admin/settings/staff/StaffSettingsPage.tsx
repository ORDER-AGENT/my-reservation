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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { useAppSession } from '@/hooks/useAppSession';
import { useEffect, useRef, useState } from 'react';
import ContentLayout from '@/components/layout/ContentLayout';
import withAuthorization from '@/components/auth/withAuthorization';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/types/user';

// スタッフフォームのスキーマ定義
const staffFormSchema = z.object({
  name: z.string().min(1, { message: 'スタッフ名を入力してください。' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url({ message: '有効なURLを入力してください。' }).optional().or(z.literal('')),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

// スケルトンコンポーネント
const StaffSettingsSkeleton = () => (
  <ContentLayout>
    <Card className="w-full max-w-2xl mx-auto mb-8">
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
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
const StaffSettingsPage = () => {
  const { session } = useAppSession();
  const storeId = session?.user.storeId as Id<'stores'> | undefined;

  // Convex API の呼び出し (後で定義)
  const createStaff = useMutation(api.staffs.createStaffWithUser);
  const updateStaff = useMutation(api.staffs.updateStaffWithUser);
  const staffs = useQuery(api.staffs.getStaffsWithUsers, storeId ? { storeId } : 'skip');

  const [editingStaffId, setEditingStaffId] = useState<Id<'staffs'> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Id<'staffs'> | null>(null);

  const formCardRef = useRef<HTMLDivElement>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      email: '',
      title: '',
      bio: '',
      imageUrl: '',
    } satisfies StaffFormValues,
  });

  useEffect(() => {
    if (editingStaffId && staffs) {
      const editingStaff = staffs.find(staff => staff!._id === editingStaffId);
      if (editingStaff) {
        form.reset({
          name: editingStaff.user.name || '',
          email: editingStaff.user.email,
          title: editingStaff.title,
          bio: editingStaff.bio || '',
          imageUrl: editingStaff.imageUrl || '',
        } satisfies StaffFormValues);
      }
    }
  }, [editingStaffId, staffs, form]);

  async function onSubmit(values: StaffFormValues) {
    if (!storeId) {
      toast.error('店舗情報が取得できませんでした。');
      return;
    }

    try {
      if (editingStaffId) {
        await updateStaff({
          staffId: editingStaffId,
          storeId,
          name: values.name,
          email: values.email,
          title: values.title,
          bio: values.bio,
          imageUrl: values.imageUrl,
        });
        toast.success('スタッフ情報を更新しました。');
      } else {
        await createStaff({
          storeId,
          name: values.name,
          email: values.email,
          title: values.title,
          bio: values.bio,
          imageUrl: values.imageUrl,
        });
        toast.success('新しいスタッフを登録しました。');
      }
      form.reset();
      setEditingStaffId(null);
    } catch (error) {
      console.error('スタッフの登録/更新に失敗しました:', error);
      toast.error('スタッフの登録/更新に失敗しました。');
    }
  }

  const handleDelete = useMutation(api.staffs.deleteStaffWithUser);

  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      try {
        await handleDelete({ staffId: staffToDelete });
        toast.success('スタッフを削除しました。');
        setIsDeleteDialogOpen(false);
        setStaffToDelete(null);
      } catch (error) {
        console.error('スタッフの削除に失敗しました:', error);
        toast.error('スタッフの削除に失敗しました。');
      }
    }
  };

  const handleEdit = (staffId: Id<'staffs'>) => {
    setEditingStaffId(staffId);
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    form.reset();
  };

  if (!staffs) {
    return <StaffSettingsSkeleton />;
  }

  return (
    <ContentLayout>
      <Card ref={formCardRef} className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>{editingStaffId ? 'スタッフ情報編集' : '新しいスタッフを登録'}</CardTitle>
          <CardDescription>新しいスタッフを追加したり、既存のスタッフ情報を編集できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>スタッフ名</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 山田 太郎" {...field} />
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
                      <Input type="email" placeholder="例: staff@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>役職 (任意)</FormLabel>
                    <FormControl>
                      <Input placeholder="例: スタイリスト" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>自己紹介 (任意)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="例: お客様の魅力を最大限に引き出すスタイルを提案します。" {...field} />
                    </FormControl>
                    <FormDescription>スタッフの自己紹介を記述します。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>プロフィール画像URL (任意)</FormLabel>
                    <FormControl>
                      <Input placeholder="例: https://example.com/staff_image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>スタッフのプロフィール画像のURLを入力します。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {editingStaffId ? 'スタッフ情報を更新' : 'スタッフを登録'}
                </Button>
                {editingStaffId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full">
                    キャンセル
                  </Button>
                )}
                {editingStaffId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setStaffToDelete(editingStaffId);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="w-full"
                  >
                    スタッフを削除
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>登録済みスタッフ</CardTitle>
          <CardDescription>現在登録されているスタッフの一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          {staffs && staffs.length > 0 ? (
            <ul className="space-y-4">
              {staffs.map(staff => (
                <li key={staff!._id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h3 className="font-semibold">{staff!.user.name} ({staff!.title})</h3>
                    <p className="text-sm text-gray-600">{staff!.user.email}</p>
                    <p className="text-sm text-gray-600">{staff!.bio}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(staff!._id)}>編集</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>登録されているスタッフはいません。</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>スタッフを削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は元に戻せません。選択したスタッフとその関連情報が完全に削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={confirmDeleteStaff}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

// HOCでラップし、管理者権限を必須にする
export default withAuthorization(
  StaffSettingsPage,
  { skeletonComponent: StaffSettingsSkeleton }
);
