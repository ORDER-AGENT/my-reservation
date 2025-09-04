import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * 指定されたスタッフのスケジュールを取得する
 * @param staffId - スタッフID
 * @returns スケジュール
 */
export const getByStaff = query({
  args: {
    staffId: v.id('staffs'),
  },
  handler: async (ctx, { staffId }) => {
    return await ctx.db
      .query('schedules')
      .withIndex('by_staff_id', (q) => q.eq('staffId', staffId))
      .unique();
  },
});

/**
 * スケジュールを登録・更新する
 */
export const createOrUpdateSchedule = mutation({
  args: {
    staffId: v.id('staffs'),
    workingHours: v.array(
      v.object({
        dayOfWeek: v.number(),
        startTime: v.string(),
        endTime: v.string(),
      }),
    ),
    specialHolidays: v.optional(v.array(v.string())),
    specialWorkdays: v.optional(
      v.array(
        v.object({
          date: v.string(),
          startTime: v.string(),
          endTime: v.string(),
        }),
      ),
    ),
    userId: v.id('users'),
  },
  handler: async (
    ctx,
    { staffId, workingHours, specialHolidays, specialWorkdays, userId },
  ) => {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // 操作対象のスタッフ情報を取得
    const targetStaff = await ctx.db.get(staffId);
    if (!targetStaff) {
      throw new Error('Target staff not found');
    }

    // 権限チェック
    const isAdmin = user.role === 'admin';
    const isSelf = targetStaff.userId === user._id;

    if (!isAdmin && !isSelf) {
      throw new Error(
        'Unauthorized: Only admins or the staff themselves can manage schedules',
      );
    }

    // 既存のスケジュールを検索
    const existingSchedule = await ctx.db
      .query('schedules')
      .withIndex('by_staff_id', (q) => q.eq('staffId', staffId))
      .unique();

    if (existingSchedule) {
      // 既存のスケジュールを更新
      await ctx.db.patch(existingSchedule._id, {
        workingHours,
        specialHolidays,
        specialWorkdays,
      });
    } else {
      // 新しいスケジュールを登録
      await ctx.db.insert('schedules', {
        staffId,
        workingHours,
        specialHolidays,
        specialWorkdays,
      });
    }
  },
});

// 30分単位のスロットを生成するヘルパー関数
const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);

  let current = startDate;
  while (current < endDate) {
    slots.push(current.toTimeString().substring(0, 5));
    current.setMinutes(current.getMinutes() + 30); // 30分間隔
  }
  return slots;
};

export const getAvailableSlots = query({
  args: {
    staffId: v.id("staffs"),
    storeId: v.id("stores"),
    startDate: v.string(), // "YYYY-MM-DD"
    endDate: v.string(),   // "YYYY-MM-DD"
    duration: v.number(), // 施術時間（分）
  },
  handler: async (ctx, { staffId, storeId, startDate, endDate, duration }) => {
    const staffSchedule = await ctx.db
      .query("schedules")
      .withIndex("by_staff_id", (q) => q.eq("staffId", staffId))
      .unique();

    const store = await ctx.db.get(storeId);
    if (!store) {
      return {};
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // endDateの終わりまで

    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_staff_and_time", (q) => q.eq("staffId", staffId))
      .filter((q) =>
        q.and(
          q.gte(q.field("dateTime"), startDateTime.getTime()),
          q.lte(q.field("dateTime"), endDateTime.getTime()),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    const availableSlotsByDate: Record<string, string[]> = {};
    const currentDate = new Date(startDateTime);

    while (currentDate <= endDateTime) {
      const dateStr = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const dayOfWeek = currentDate.getDay();

      // 1. 店舗の休日チェック
      if (store.specialHolidays?.includes(dateStr)) {
        availableSlotsByDate[dateStr] = [];
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // 2. スタッフの休日チェック
      if (staffSchedule?.specialHolidays?.includes(dateStr)) {
        availableSlotsByDate[dateStr] = [];
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      let dayStartTime: string | null = null;
      let dayEndTime: string | null = null;

      // 3. スタッフの特別勤務日を優先
      const specialWorkday = staffSchedule?.specialWorkdays?.find(
        (d) => d.date === dateStr
      );
      if (specialWorkday) {
        dayStartTime = specialWorkday.startTime;
        dayEndTime = specialWorkday.endTime;
      } else {
        // 4. 通常の勤務時間を取得
        const storeOpeningHour = store.openingHours.find(
          (h) => h.dayOfWeek === dayOfWeek
        );
        const staffWorkingHour = staffSchedule?.workingHours.find(
          (h) => h.dayOfWeek === dayOfWeek
        );

        if (!storeOpeningHour || !staffWorkingHour) {
            availableSlotsByDate[dateStr] = [];
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }
        
        // 店舗とスタッフの両方が営業している時間を採用
        dayStartTime =
            storeOpeningHour.startTime > staffWorkingHour.startTime
            ? storeOpeningHour.startTime
            : staffWorkingHour.startTime;
        dayEndTime =
            storeOpeningHour.endTime < staffWorkingHour.endTime
            ? storeOpeningHour.endTime
            : staffWorkingHour.endTime;
      }

      if (!dayStartTime || !dayEndTime) {
        availableSlotsByDate[dateStr] = [];
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // 5. 30分単位の全スロットを生成
      const allSlots = generateTimeSlots(dayStartTime, dayEndTime);
      let availableSlots: string[] = [...allSlots];

      // 6. 既存の予約でスロットをブロック
      for (const reservation of reservations) {
        const reservationDate = new Date(reservation.dateTime);
        if (reservationDate.toISOString().split("T")[0] === dateStr) {
          const reservationDuration = reservation.totalDuration;
          
          availableSlots = availableSlots.filter(slot => {
            const slotStart = new Date(`${dateStr}T${slot}:00`).getTime();
            const slotEnd = slotStart + 30 * 60 * 1000; // 30分スロットの終了時刻
            const reservationEnd = reservation.dateTime + reservationDuration * 60 * 1000;
            
            // スロットが予約時間と重複していないかチェック
            // (slotEnd <= reservation.dateTime) OR (slotStart >= reservationEnd)
            return slotEnd <= reservation.dateTime || slotStart >= reservationEnd;
          });
        }
      }

      // 7. 施術時間（duration）を確保できるスロットのみをフィルタリング
      const requiredSlotsCount = Math.ceil(duration / 30);
      if (requiredSlotsCount > 0) {
        availableSlots = availableSlots.filter((_, index) => {
          if (index + requiredSlotsCount > availableSlots.length) return false;
          
          // 連続したスロットが必要な場合
          if (requiredSlotsCount > 1) {
            const firstSlotTime = new Date(`${dateStr}T${availableSlots[index]}:00`).getTime();
            // 最後のスロットの開始時刻を取得
            const lastSlotTime = new Date(`${dateStr}T${availableSlots[index + requiredSlotsCount - 1]}:00`).getTime();
            
            // 連続しているかチェック（各スロットは30分間隔のはず）
            return (lastSlotTime - firstSlotTime) === (requiredSlotsCount - 1) * 30 * 60 * 1000;
          }
          // スロットが1つだけ必要な場合
          return true;
        });
      }


      availableSlotsByDate[dateStr] = availableSlots;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { slots: availableSlotsByDate, staffId };
  },
});