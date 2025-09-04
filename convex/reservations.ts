import { mutation } from "./_generated/server";
import { v } from "convex/values";

// 予約番号を生成するヘルパー関数 (簡易的なもの)
function generateReservationNumber(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const createGuestReservation = mutation({
  args: {
    staffId: v.id("staffs"),
    serviceId: v.id("services"),
    storeId: v.id("stores"),
    dateTime: v.number(),
    totalPrice: v.number(),
    totalDuration: v.number(),
    notes: v.optional(v.string()),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const reservationNumber = generateReservationNumber(); // 予約番号を生成

    const reservationId = await ctx.db.insert("reservations", {
      customerId: undefined, // ゲスト予約なのでcustomerIdは設定しない
      staffId: args.staffId,
      serviceId: args.serviceId,
      storeId: args.storeId,
      dateTime: args.dateTime,
      status: "pending", // 仮予約として登録
      totalPrice: args.totalPrice,
      totalDuration: args.totalDuration,
      notes: args.notes,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone: args.guestPhone,
      reservationNumber: reservationNumber,
    });

    return { reservationId, reservationNumber };
  },
});

export const createReservation = mutation({
  args: {
    staffId: v.id("staffs"),
    serviceId: v.id("services"),
    storeId: v.id("stores"),
    dateTime: v.number(),
    totalPrice: v.number(),
    totalDuration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // `tokenIdentifier` を使って `users` テーブルからユーザーを検索
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    const reservationNumber = generateReservationNumber();

    const reservationId = await ctx.db.insert("reservations", {
      customerId: user._id, // 取得したユーザーのID (Id<"users">型) をセット
      staffId: args.staffId,
      serviceId: args.serviceId,
      storeId: args.storeId,
      dateTime: args.dateTime,
      status: "pending",
      totalPrice: args.totalPrice,
      totalDuration: args.totalDuration,
      notes: args.notes,
      reservationNumber: reservationNumber,
      // ゲスト情報は不要
    });

    return { reservationId, reservationNumber };
  },
});