'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

import ContentLayout from '@/components/layout/ContentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppSession } from '@/hooks/useAppSession';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { daysOfWeek } from '@/lib/date';
import { Skeleton } from '@/components/ui/skeleton';

type WorkingHour = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isHoliday: boolean;
};

const SchedulePage = () => {
  const { session } = useAppSession();
  const storeId = session?.user.storeId;
  const userId = session?.user.id;

  const staffs = useQuery(
    api.staffs.getStaffsWithUsers,
    storeId ? { storeId: storeId as Id<'stores'> } : 'skip',
  );

  const [selectedStaffId, setSelectedStaffId] = useState<Id<'staffs'>>();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const schedule = useQuery(
    api.schedules.getByStaff,
    selectedStaffId ? { staffId: selectedStaffId } : 'skip',
  );

  const isLoading = schedule === undefined;

  const createOrUpdate = useMutation(api.schedules.createOrUpdateSchedule);

  // スタッフが切り替わったら、編集状態をリセット
  useEffect(() => {
    setIsDirty(false);
  }, [selectedStaffId]);

  // DBから取得したスケジュールでUIの状態を初期化・更新する
  // ユーザーが編集中は実行しない
  useEffect(() => {
    if (isDirty || isLoading) return;

    if (schedule) {
      const newWorkingHours = daysOfWeek.map((day) => {
        const existing = schedule.workingHours.find(
          (wh) => wh.dayOfWeek === day.id,
        );
        return {
          dayOfWeek: day.id,
          startTime: existing?.startTime || '09:00',
          endTime: existing?.endTime || '18:00',
          isHoliday: !existing,
        };
      });
      setWorkingHours(newWorkingHours);
    } else {
      // スケジュールがない場合は全曜日を休日に設定
      setWorkingHours(
        daysOfWeek.map((day) => ({
          dayOfWeek: day.id,
          startTime: '09:00',
          endTime: '18:00',
          isHoliday: true, // 全て休日に
        })),
      );
    }
  }, [schedule, isDirty, isLoading]);

  const handleTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index][field] = value;
    setWorkingHours(newWorkingHours);
    setIsDirty(true);
  };

  const handleHolidayToggle = (index: number) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index].isHoliday = !newWorkingHours[index].isHoliday;
    setWorkingHours(newWorkingHours);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedStaffId) {
      toast.error('スタッフを選択してください。');
      return;
    }
    if (!userId) {
      toast.error('認証情報が見つかりません。');
      return;
    }

    try {
      await createOrUpdate({
        staffId: selectedStaffId,
        workingHours: workingHours
          .filter((wh) => !wh.isHoliday)
          .map(({ dayOfWeek, startTime, endTime }) => ({
            dayOfWeek,
            startTime,
            endTime,
          })),
        // TODO: specialHolidays, specialWorkdays のUIを追加する
        userId: userId as Id<'users'>,
      });
      toast.success('スケジュールを保存しました。');
      setIsDirty(false); // 保存が成功したので、編集状態をリセット
    } catch (error) {
      console.error(error);
      toast.error('スケジュールの保存に失敗しました。');
    }
  };

  return (
    <ContentLayout>
      <Card>
        <CardHeader>
          <CardTitle>勤務スケジュール設定</CardTitle>
          <CardDescription>
            スタッフを選択して、曜日ごとの勤務時間を設定します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              スタッフを選択
            </label>
            <Select
              onValueChange={(value) => {
                setSelectedStaffId(value as Id<'staffs'>);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="スタッフを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {staffs?.map((staff) =>
                  staff ? (
                    <SelectItem key={staff._id} value={staff._id}>
                      {staff.user?.name}
                    </SelectItem>
                  ) : null,
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedStaffId && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本勤務時間</h3>
              {isLoading ? (
                <div className="space-y-4 rounded-md border p-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day.id}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <Skeleton className="h-6 w-10" />
                      <div className="col-span-2 flex items-center gap-2">
                        <Skeleton className="h-10 w-full" />
                        <span>-</span>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-6 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 rounded-md border p-4">
                  {workingHours.map((wh, index) => (
                    <div
                      key={wh.dayOfWeek}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <Label className="font-semibold">
                        {daysOfWeek.find((d) => d.id === wh.dayOfWeek)?.name}
                      </Label>
                      <div className="col-span-2 flex items-center gap-2">
                        <Input
                          type="time"
                          value={wh.startTime}
                          onChange={(e) =>
                            handleTimeChange(index, 'startTime', e.target.value)
                          }
                          disabled={wh.isHoliday}
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={wh.endTime}
                          onChange={(e) =>
                            handleTimeChange(index, 'endTime', e.target.value)
                          }
                          disabled={wh.isHoliday}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`holiday-${wh.dayOfWeek}`}
                          checked={wh.isHoliday}
                          onCheckedChange={() => handleHolidayToggle(index)}
                        />
                        <Label htmlFor={`holiday-${wh.dayOfWeek}`}>休日</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedStaffId && (
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                スタッフを選択してください
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!selectedStaffId || !isDirty}
            >
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

export default SchedulePage;