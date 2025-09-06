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
} from '@/components/ui/dialog';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { useAppSession } from '@/hooks/useAppSession';
import { useEffect, useRef, useState } from 'react';
import ContentLayout from '@/components/layout/ContentLayout';
import withAuthorization from '@/components/auth/withAuthorization';
import { Skeleton } from '@/components/ui/skeleton';
import useAuthorization from '@/hooks/useAuthorization';
import Image from 'next/image';

// スタッフフォームのスキーマ定義
const staffFormSchema = z.object({
  name: z.string().min(1, { message: 'スタッフ名を入力してください。' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
  password: z.string().min(6, { message: "パスワードは6文字以上である必要があります。" }).optional(), // 新規登録時のみ必須
  confirmPassword: z.string().optional(), // 新規登録時のみ必須
  currentPassword: z.string().optional(), // パスワード変更時のみ使用
  newPassword: z.string().min(6, { message: "新しいパスワードは6文字以上である必要があります。" }).optional(), // パスワード変更時のみ使用
  confirmNewPassword: z.string().optional(), // パスワード変更時のみ使用
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  storageId: z.string().optional(),
}).refine((data) => {
  // 新規登録時、またはパスワードが入力された場合にのみパスワードの一致を検証
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true; // パスワードが入力されていない場合は検証しない
}, {
  message: "パスワードが一致しません。",
  path: ["confirmPassword"],
}).refine((data) => {
  // パスワード変更時、新しいパスワードが入力された場合にのみ検証
  if (data.newPassword || data.confirmNewPassword) {
    return data.newPassword === data.confirmNewPassword;
  }
  return true; // 新しいパスワードが入力されていない場合は検証しない
}, {
  message: "新しいパスワードが一致しません。",
  path: ["confirmNewPassword"],
}).refine((data) => {
  // 新しいパスワードが入力された場合、現在のパスワードも必須
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "現在のパスワードを入力してください。",
  path: ["currentPassword"],
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
  const { isReadOnly } = useAuthorization();
  const storeId = session?.user.storeId as Id<'stores'> | undefined;

  const createStaff = useAction(api.staffs.createStaffWithUser);
  const updateStaff = useMutation(api.staffs.updateStaffWithUser);
  const staffs = useQuery(api.staffs.getStaffsWithUsers, storeId ? { storeId } : 'skip');
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateStaffPassword = useAction(api.users.updateUserPassword);

  const [editingStaffId, setEditingStaffId] = useState<Id<'staffs'> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Id<'staffs'> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const formCardRef = useRef<HTMLDivElement>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      title: '',
      bio: '',
      imageUrl: '',
      storageId: '',
    } satisfies StaffFormValues,
  });

  useEffect(() => {
    if (editingStaffId && staffs) {
      const editingStaff = staffs.find(staff => staff!._id === editingStaffId);
      if (editingStaff) {
        form.reset({
          name: editingStaff.user.name || '',
          email: editingStaff.user.email,
          title: editingStaff.title || '',
          bio: editingStaff.bio || '',
          imageUrl: editingStaff.imageUrl || '',
          storageId: editingStaff.storageId || '',
        } satisfies StaffFormValues);
      }
    }
  }, [editingStaffId, staffs, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      
      form.setValue('storageId', storageId);
      form.setValue('imageUrl', '');
      toast.success('画像をアップロードしました。');

    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
      toast.error('画像のアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: StaffFormValues) {
    if (isReadOnly) {
      toast.warning('読み取り専用のため、操作は許可されていません。');
      return;
    }
    if (!storeId) {
      toast.error('店舗情報が取得できませんでした。');
      return;
    }

    try {
      if (editingStaffId) {
        // パスワード変更の処理
        if (values.newPassword) {
          if (!values.currentPassword) {
            toast.error("現在のパスワードを入力してください。");
            return;
          }
          if (values.newPassword !== values.confirmNewPassword) {
            toast.error("新しいパスワードが一致しません。");
            return;
          }

          // 編集中のスタッフの userId を取得
          const editingStaff = staffs?.find(staff => staff!._id === editingStaffId);
          if (!editingStaff || !editingStaff.userId) {
            toast.error("スタッフ情報が見つかりませんでした。");
            return;
          }

          // パスワード更新アクションを呼び出す
          await updateStaffPassword({
            userId: editingStaff.userId,
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          toast.success("パスワードを更新しました。");
          // パスワード更新が成功したら、スタッフ情報更新のトーストは表示しない
          await updateStaff({
            staffId: editingStaffId,
            storeId,
            name: values.name,
            email: values.email,
            title: values.title,
            bio: values.bio,
            imageUrl: values.imageUrl,
            storageId: values.storageId ? (values.storageId as Id<'_storage'>) : undefined,
          });
        } else {
          // パスワードが変更されていない場合のみ、スタッフ情報更新のトーストを表示
          await updateStaff({
            staffId: editingStaffId,
            storeId,
            name: values.name,
            email: values.email,
            title: values.title,
            bio: values.bio,
            imageUrl: values.imageUrl,
            storageId: values.storageId ? (values.storageId as Id<'_storage'>) : undefined,
          });
          toast.success('スタッフ情報を更新しました。');
        }
      } else {
        // 新規登録時のみパスワードを渡す
        await createStaff({
          storeId,
          ...values,
          password: values.password!,
          storageId: values.storageId ? (values.storageId as Id<'_storage'>) : undefined,
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
    if (isReadOnly) {
      toast.warning('読み取り専用のため、操作は許可されていません。');
      return;
    }
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
    if (isReadOnly) return;
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
          <CardDescription>
            新しいスタッフを追加したり、既存のスタッフ情報を編集できます。
            {isReadOnly && (
              <p className="text-yellow-600 mt-2">
                現在、読み取り専用モードです。情報の編集はできません。
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <fieldset disabled={isReadOnly}>
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
                {!editingStaffId ? ( // 新規登録時のみパスワードフィールドを表示
                  <>
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
                  </>
                ) : ( // 編集時のみパスワード変更フィールドを表示
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-2">パスワード変更</h3>
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>現在のパスワード</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="現在のパスワード" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新しいパスワード</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="新しいパスワード" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmNewPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新しいパスワード（確認）</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="新しいパスワード（確認）" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
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
                        <Input 
                          placeholder="https://example.com/staff_image.jpg" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('storageId', '');
                          }}
                        />
                      </FormControl>
                      <FormDescription>画像のURLを直接入力するか、下のボタンからアップロードしてください。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>画像をアップロード</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading || isReadOnly} />
                  </FormControl>
                  {isUploading && <p className="text-sm text-gray-500">アップロード中...</p>}
                </FormItem>
              </fieldset>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isUploading || isReadOnly}>
                  {editingStaffId ? 'スタッフ情報を更新' : 'スタッフを登録'}
                </Button>
                {editingStaffId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full" disabled={isReadOnly}>
                    キャンセル
                  </Button>
                )}
                {editingStaffId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (isReadOnly) return;
                      setStaffToDelete(editingStaffId);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="w-full"
                    disabled={isReadOnly}
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
              {staffs.filter((staff) => staff !== null).map(staff => (
                <li key={staff!._id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    {staff.imageUrl ? (
                      <Image
                        src={staff.imageUrl}
                        alt={staff.user.name || 'スタッフ画像'}
                        width={64}
                        height={64}
                        className="rounded-full object-cover w-16 h-16"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{staff!.user.name} ({staff!.title})</h3>
                      <p className="text-sm text-gray-600">{staff!.user.email}</p>
                      <p className="text-sm text-gray-600">{staff!.bio}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(staff!._id)} disabled={isReadOnly}>編集</Button>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={confirmDeleteStaff} disabled={isReadOnly}>削除</Button>
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