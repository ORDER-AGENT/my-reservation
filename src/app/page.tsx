import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ContentLayout from '@/components/layout/ContentLayout';

// ヘッダー
/*
const createHeader = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">お客様トップ</h1>
    </div>
  );
};

headerContent={createHeader()}
*/

// フッター
const createFooter = () => {
  return (
    <div className="p-4">
      <p className="text-center">© 2025 ORDER AGENT</p>
    </div>
  );
};

export default function CustomerTopPage() {
  return (
    <ContentLayout
      isHeaderFixed={true}
      footerContent={createFooter()}
      isFooterFixed={true}
    >
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">オンライン予約</h1>
          <p className="text-lg text-muted-foreground mb-8">
            簡単なステップで、いつでもご予約いただけます。
          </p>
          <Button asChild size="lg">
            <Link href="/customer/reservation">予約をはじめる</Link>
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
