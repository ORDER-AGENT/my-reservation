'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  selectedDateTimeAtom,
  selectedStaffAtom,
  selectedMenusAtom,
  availableSlotsAtom,
} from '@/atoms/reservation';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { FaRegCircle, FaTimes } from 'react-icons/fa';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';

// 日付を "YYYY-MM-DD" 形式の文字列にフォーマットするヘルパー関数
// この関数は、ローカルタイムゾーンに基づいて日付をフォーマットします。
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月は0から始まるため+1
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DateTimeStep() {
  const [selectedDateTime, setSelectedDateTime] = useAtom(selectedDateTimeAtom);
  const [selectedStaff] = useAtom(selectedStaffAtom);
  const [selectedMenus] = useAtom(selectedMenusAtom);
  const setAvailableSlots = useSetAtom(availableSlotsAtom);
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  const totalDuration = useMemo(
    () => selectedMenus.reduce((total, menu) => total + menu.duration, 0),
    [selectedMenus],
  );

  useEffect(() => {
    if (selectedMenus.length === 0) {
      router.replace('/customer/reservation/menu');
      return;
    }
    if (!selectedStaff) {
      router.replace('/customer/reservation/staff');
      return;
    }
  }, [selectedStaff, selectedMenus, router]);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        //console.log(`Debug: new Date() inside useMemo (iteration ${i}) =`, date);
        date.setHours(0, 0, 0, 0); // 時刻をリセットして日付のみで比較
        date.setDate(date.getDate() + i + weekOffset * 7);
        return date;
      }),
    [weekOffset],
  );

  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  /*
  console.log("Debug: startDate =", startDate);
  console.log("Debug: endDate =", endDate);
  console.log("Debug: weekDates[0] (Date object) =", weekDates[0]);
  console.log("Debug: weekDates[6] (Date object) =", weekDates[6]);
  */

  const availableSlotsResult = useQuery(
    api.schedules.getAvailableSlots,
    selectedStaff && totalDuration > 0
      ? {
          staffId: selectedStaff._id,
          storeId: selectedStaff.storeId,
          startDate,
          endDate,
          duration: totalDuration,
        }
      : 'skip',
  );

  const availableSlots = availableSlotsResult?.slots;

  // availableSlotsが更新されたらatomに書き込む
  useEffect(() => {
    setAvailableSlots(availableSlots);
  }, [availableSlots, setAvailableSlots]);

  console.log("availableSlots", availableSlots);

  // その週のユニークな時間スロットをすべて取得し、ソートする
  const timeSlots = useMemo(() => {
    if (!availableSlots) return [];
    const allSlots = new Set<string>();
    // 予約可能な時間帯をすべて集める
    Object.values(availableSlots).forEach((slots) => {
      slots.forEach((slot) => allSlots.add(slot));
    });
    // 時間帯をソートして返す
    return Array.from(allSlots).sort((a, b) => a.localeCompare(b));
  }, [availableSlots]);

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
  };

  const firstDate = weekDates[0];
  const lastDate = weekDates[6];
  const monthDisplay =
    firstDate.getMonth() === lastDate.getMonth()
      ? `${firstDate.getFullYear()}年 ${firstDate.toLocaleDateString('ja-JP', {
          month: 'long',
        })}`
      : `${firstDate.getFullYear()}年 ${firstDate.toLocaleDateString(
          'ja-JP',
          { month: 'long' },
        )} / ${lastDate.getFullYear()}年 ${lastDate.toLocaleDateString(
          'ja-JP',
          { month: 'long' },
        )}`;

  const handlePrevWeek = () => setWeekOffset((prev) => Math.max(0, prev - 1));
  const handleNextWeek = () => setWeekOffset((prev) => Math.min(3, prev + 1));

  const isLoading =
    availableSlotsResult === undefined ||
    availableSlotsResult?.staffId !== selectedStaff?._id;

  return (
    <div className="relative overflow-visible">
      {/* --- 固定ヘッダー --- */}
      <div className="sticky top-[calc(var(--reservation-header-height)+var(--header-height))] z-10 bg-white/80 backdrop-blur-xl p-4 pb-2">
        {/* 週選択 */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={handlePrevWeek}
            disabled={weekOffset === 0}
          >
            前の1週間
          </Button>
          <h3 className="text-lg font-semibold">{monthDisplay}</h3>
          <Button
            variant="outline"
            onClick={handleNextWeek}
            disabled={weekOffset === 3}
          >
            次の1週間
          </Button>
        </div>
        {/* 日付ヘッダーグリッド */}
        <div className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1 text-sm">
          <div /> {/* 時間列のヘッダー */}
          {weekDates.map((date) => {
            const day = date.getDay();
            const isSunday = day === 0;
            const isSaturday = day === 6;

            const dayClass = isSunday
              ? 'bg-red-100 text-red-700'
              : isSaturday
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100';

            return (
              <div
                key={date.toISOString()}
                className={`text-center font-semibold p-1 rounded-t-md ${dayClass}`}
              >
                <div>{date.getDate()}</div>
                <div className="text-xs">{`(${date.toLocaleDateString('ja-JP', {
                  weekday: 'short',
                })})`}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- スクロールするコンテンツ --- */}
      <div className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1 text-sm px-4 pb-4 pt-2">
        {isLoading ? (
          // ローディングスケルトン
          Array.from({ length: 10 }).map((_, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="text-center font-semibold p-2">
                <Skeleton className="h-4 w-10 mx-auto" />
              </div>
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="flex justify-center items-center">
                  <Skeleton className="w-full h-10 rounded-none" />
                </div>
              ))}
            </React.Fragment>
          ))
        ) : timeSlots.length > 0 ? (
          timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="text-center font-semibold p-2 flex items-center justify-center h-10">
                {time}
              </div>
              {weekDates.map((date) => {
                const [hours, minutes] = time.split(':').map(Number);
                const currentDateTime = new Date(date);
                currentDateTime.setHours(hours, minutes, 0, 0);

                const isSelected =
                  selectedDateTime?.getTime() === currentDateTime.getTime();
                const isPast = currentDateTime < new Date();

                const dateStr = formatDate(date);
                const isAvailable =
                  availableSlots?.[dateStr]?.includes(time) ?? false;

                return (
                  <div
                    key={date.toISOString()}
                    className="flex justify-center items-center h-10"
                  >
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full h-full p-2 text-xs rounded-none"
                      onClick={() => handleDateTimeSelect(currentDateTime)}
                      disabled={isPast || !isAvailable}
                    >
                      {isPast ? (
                        <FaTimes className="text-slate-500" />
                      ) : isAvailable ? (
                        <FaRegCircle />
                      ) : (
                        <FaTimes className="text-slate-500" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-8 text-center p-8 text-slate-500">
            この週に予約可能な時間がありません。
          </div>
        )}
      </div>
    </div>
  );
}
