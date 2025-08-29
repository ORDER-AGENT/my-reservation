'use client';

import { Calendar } from '@/components/ui/calendar';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { selectedDateTimeAtom, selectedStaffAtom, selectedMenusAtom } from '@/atoms/reservation';
import { useRouter } from 'next/navigation';

export default function DateTimeStep() {
  const [selectedDateTime, setSelectedDateTime] = useAtom(selectedDateTimeAtom);
  const [selectedStaff] = useAtom(selectedStaffAtom);
  const [selectedMenus] = useAtom(selectedMenusAtom);
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(selectedDateTime ? new Date(selectedDateTime) : undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    selectedDateTime ? `${selectedDateTime.getHours().toString().padStart(2, '0')}:${selectedDateTime.getMinutes().toString().padStart(2, '0')}` : undefined
  );

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
    // 既存のselectedDateTimeのロジック
    if (selectedDateTime) {
      setDate(new Date(selectedDateTime));
      setSelectedTime(`${selectedDateTime.getHours().toString().padStart(2, '0')}:${selectedDateTime.getMinutes().toString().padStart(2, '0')}`);
    } else {
      setDate(undefined);
      setSelectedTime(undefined);
    }
  }, [selectedDateTime, selectedStaff, selectedMenus, router]);

  // 仮の時間帯リスト
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  ];

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    // 日付が変更されたら、選択中の時間をリセット
    setSelectedTime(undefined);
    setSelectedDateTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (date) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, 0, 0);
      setSelectedDateTime(newDateTime);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold mb-4">日付を選択</h2>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        className="rounded-md border shadow"
      />

      {date && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">時間を選択</h2>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                className={`p-2 border rounded-md ${
                  selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
