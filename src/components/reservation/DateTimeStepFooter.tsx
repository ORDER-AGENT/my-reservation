import { Button } from '@/components/ui/button';
import { selectedDateTimeAtom } from '@/atoms/reservation';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation'; // 追加

interface DateTimeStepFooterProps {
  canProceedToDateTimeSelection: boolean;
}

export default function DateTimeStepFooter({
  canProceedToDateTimeSelection,
}: DateTimeStepFooterProps) {
  const [selectedDateTime] = useAtom(selectedDateTimeAtom);
  const router = useRouter(); // 追加

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            前に戻る
          </Button>
        </div>
        <div className="flex-grow text-center"> {/* 変更 */}
          <h2 className="text-lg font-semibold">選択中の日時</h2>
          <p className="text-sm text-muted-foreground">
            {selectedDateTime
              ? selectedDateTime.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '未選択'}
          </p>
        </div>
        <div>
          <Button
            size="lg"
            onClick={() => router.push('/customer/reservation/confirm')}
            disabled={!canProceedToDateTimeSelection}
            variant={canProceedToDateTimeSelection ? 'default' : 'outline'}
          >
            予約内容確認へ
          </Button>
        </div>
      </div>
    </div>
  );
}
