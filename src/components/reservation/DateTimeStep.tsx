'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { selectedDateTimeAtom, selectedStaffAtom, selectedMenusAtom } from '@/atoms/reservation';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { FaRegCircle, FaTimes } from 'react-icons/fa';

export default function DateTimeStep() {
  const [selectedDateTime, setSelectedDateTime] = useAtom(selectedDateTimeAtom);
  const [selectedStaff] = useAtom(selectedStaffAtom);
  const [selectedMenus] = useAtom(selectedMenusAtom);
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    // メニューが選択されていない場合、メニュー選択画面にリダイレクト
    if (selectedMenus.length === 0) {
      router.replace('/customer/reservation/menu');
      return; // リダイレクトしたら以降の処理は不要
    }
    // スタッフが選択されていない場合、スタッフ選択画面にリダイレクト
    if (!selectedStaff) {
      router.replace('/customer/reservation/staff');
      return; // リダイレクトしたら以降の処理は不要
    }
  }, [selectedStaff, selectedMenus, router]);

  // 仮の時間帯リスト
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  ];

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
  };

  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i + weekOffset * 7);
    return date;
  });

  const firstDate = weekDates[0];
  const lastDate = weekDates[6];
  const monthDisplay =
    firstDate.getMonth() === lastDate.getMonth()
      ? `${firstDate.getFullYear()}年 ${firstDate.toLocaleDateString('ja-JP', { month: 'long' })}`
      : `${firstDate.getFullYear()}年 ${firstDate.toLocaleDateString('ja-JP', {
          month: 'long',
        })} / ${lastDate.getFullYear()}年 ${lastDate.toLocaleDateString('ja-JP', { month: 'long' })}`;

  const handlePrevWeek = () => setWeekOffset((prev) => Math.max(0, prev - 1));
  const handleNextWeek = () => setWeekOffset((prev) => Math.min(3, prev + 1));

  return (
    <div className="relative overflow-visible">
      {/* --- 固定ヘッダー --- */}
      <div className="sticky top-[calc(var(--reservation-header-height)+var(--header-height))] z-10  bg-white/80 backdrop-blur-xl p-4 pb-2">
        {/* 週選択 */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={handlePrevWeek} disabled={weekOffset === 0}>
            前の1週間
          </Button>
          <h3 className="text-lg font-semibold">{monthDisplay}</h3>
          <Button variant="outline" onClick={handleNextWeek} disabled={weekOffset === 3}>
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
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="text-center font-semibold p-2">{time}</div>
            {weekDates.map((date) => {
              const [hours, minutes] = time.split(':').map(Number);
              const currentDateTime = new Date(date);
              currentDateTime.setHours(hours, minutes, 0, 0);

              const isSelected = selectedDateTime?.getTime() === currentDateTime.getTime();

              // 過去の時間は選択不可にする
              const isPast = currentDateTime < new Date();

              return (
                <div key={date.toISOString()} className="flex justify-center items-center">
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full h-full p-2 text-xs rounded-none"
                    onClick={() => handleDateTimeSelect(currentDateTime)}
                    disabled={isPast}
                  >
                    {isPast ? <FaTimes /> : <FaRegCircle />}
                  </Button>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}