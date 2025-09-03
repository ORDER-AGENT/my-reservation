'use client';

import useAuthorization from '@/hooks/useAuthorization';
import React, { ComponentType, useEffect } from 'react';
import ContentLayout from '../layout/ContentLayout';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import AdminRegistrationForm from '@/app/admin/settings/store/AdminRegistrationForm';

const AuthSkeleton = () => (
  <ContentLayout>
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="border rounded-lg p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  </ContentLayout>
);

interface WithAuthorizationOptions {
  skeletonComponent?: React.ComponentType;
}

const withAuthorization = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithAuthorizationOptions
) => {
  const WithAuthorizationComponent: React.FC<P> = props => {
    const { isLoading, isAuthorized, isUnauthenticated, isSystemInitialized } = useAuthorization();
    const router = useRouter();

    useEffect(() => {
      // 初期化チェックが不要な場合、または初期化済みの場合は、通常の権限チェックとリダイレクトを行う
      if (!isLoading && !isAuthorized && isSystemInitialized) {
        if (isUnauthenticated) {
          router.push('/auth/signin');
        } else {
          // 認証済みだが権限がない場合
          router.push('/');
        }
      }
    }, [isLoading, isAuthorized, isUnauthenticated, isSystemInitialized, router]);

    if (isLoading) {
      const SkeletonComponent = options?.skeletonComponent;
      return SkeletonComponent ? <SkeletonComponent /> : <AuthSkeleton />;
    }

    // 初期化が必要で、まだされていない場合、管理者登録フォームを表示
    if (!isSystemInitialized) {
      return <AdminRegistrationForm />;
    }

    if (!isAuthorized) {
      // リダイレクトが実行されるまでの間、何も表示しない
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // displayNameを設定してデバッグしやすくする
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuthorizationComponent.displayName = `withAuthorization(${displayName})`;

  return WithAuthorizationComponent;
};

export default withAuthorization;