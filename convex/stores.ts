import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';

/**
 * ストア情報を取得する
 */
export const getStore = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // ユーザーIDからユーザー情報を取得
    const user = await ctx.db.get(args.userId);

    // ユーザーが存在しない場合はエラー
    if (!user) {
      throw new ConvexError('User not found');
    }

    console.log(user);

    // ユーザーが管理者でない場合はエラー
    if (user.role !== 'admin') {
      throw new ConvexError('Not authorized');
    }

    // ユーザーに紐づく店舗情報を取得
    if (!user.storeId) {
      // storeId がない場合は、まだ店舗が作成されていない
      return null;
    }

    const store = await ctx.db.get(user.storeId);
    return store;
  },
});

/**
 * ストア情報を作成または更新する
 */
export const createOrUpdateStore = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    openingHours: v.array(
      v.object({
        dayOfWeek: v.number(),
        startTime: v.string(),
        endTime: v.string(),
      }),
    ),
    specialHolidays: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // ユーザー情報を取得
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError('User not found');
    }

    if (user.role !== 'admin') {
      throw new ConvexError('Not authorized');
    }

    // ユーザーに紐づく店舗情報があるか確認
    if (user.storeId) {
      // 既存の店舗情報を更新
      await ctx.db.patch(user.storeId, {
        name: args.name,
        address: args.address,
        phone: args.phone,
        openingHours: args.openingHours,
        specialHolidays: args.specialHolidays,
      });
    } else {
      // 新しい店舗情報を作成
      const storeId = await ctx.db.insert('stores', {
        name: args.name,
        address: args.address,
        phone: args.phone,
        openingHours: args.openingHours,
        specialHolidays: args.specialHolidays,
      });
      // ユーザー情報に店舗IDを紐付け
      await ctx.db.patch(user._id, { storeId });
    }
  },
});

/**
 * 最初の店舗情報を1件取得する
 */
export const getFirst = query({
  handler: async (ctx) => {
    // 最も単純な方法として、データベース内の最初の店舗を返す
    const store = await ctx.db.query("stores").first();
    return store;
  },
});