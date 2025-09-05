import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// スタッフを作成するミューテーション
export const create = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.id("stores"),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const staffId = await ctx.db.insert("staffs", args);
    return staffId;
  },
});

// スタッフ情報を更新するミューテーション
export const update = mutation({
  args: {
    staffId: v.id("staffs"),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { staffId, ...rest } = args;
    const existingStaff = await ctx.db.get(staffId);
    if (existingStaff?.storageId && existingStaff.storageId !== args.storageId) {
      await ctx.storage.delete(existingStaff.storageId);
    }
    await ctx.db.patch(staffId, rest);
  },
});

// ユーザー情報と紐付けてスタッフを作成するミューテーション (StaffSettingsPage.tsx から呼び出される)
export const createStaffWithUser = action({
  args: {
    storeId: v.id("stores"),
    name: v.optional(v.string()),
    email: v.string(),
    password: v.string(),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args): Promise<Id<"staffs">> => {
    // ユーザーを登録
    const userId: Id<"users"> = await ctx.runAction(api.users.createUser, {
      name: args.name,
      email: args.email,
      password: args.password,
      role: "staff",
      storeId: args.storeId,
    });

    // スタッフ情報を登録
    const staffId = await ctx.runMutation(api.staffs.create, {
      userId,
      storeId: args.storeId,
      title: args.title,
      bio: args.bio,
      imageUrl: args.imageUrl,
      storageId: args.storageId,
    });

    return staffId;
  },
});

// ユーザー情報と紐付けてスタッフ情報を更新するミューテーション (StaffSettingsPage.tsx から呼び出される)
export const updateStaffWithUser = mutation({
  args: {
    staffId: v.id("staffs"),
    storeId: v.id("stores"), // storeId は変更しないが、認証のために必要になる可能性
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { staffId, storeId, name, email, title, bio, imageUrl, storageId } = args;

    // スタッフ情報を取得
    const existingStaff = await ctx.db.get(staffId);
    if (!existingStaff) {
      throw new Error("Staff not found.");
    }

    // 古いファイルを削除
    if (existingStaff.storageId && existingStaff.storageId !== storageId) {
      await ctx.storage.delete(existingStaff.storageId);
    }

    // ユーザー情報を更新
    if (existingStaff.userId) {
      await ctx.db.patch(existingStaff.userId, {
        name,
        email,
      });
    }

    // スタッフ詳細情報を更新
    await ctx.db.patch(staffId, {
      title,
      bio,
      imageUrl,
      storageId,
    });
  },
});

// スタッフのパスワードを更新するミューテーション
export const updateStaffPassword = action({
  args: {
    staffId: v.id("staffs"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { staffId, currentPassword, newPassword } = args;

    const existingStaff = await ctx.runQuery(api.staffs.getStaff, { staffId });
    if (!existingStaff) {
      throw new Error("Staff not found.");
    }

    // ユーザーのパスワードを更新
    await ctx.runAction(api.users.updateUserPassword, {
      userId: existingStaff.userId,
      currentPassword,
      newPassword,
    });
  },
});

// ユーザー情報と紐付けてスタッフを削除するミューテーション
export const deleteStaffWithUser = mutation({
  args: {
    staffId: v.id("staffs"),
  },
  handler: async (ctx, args) => {
    const { staffId } = args;

    // スタッフ情報を取得
    const existingStaff = await ctx.db.get(staffId);
    if (!existingStaff) {
      throw new Error("Staff not found.");
    }

    // ストレージからファイルを削除
    if (existingStaff.storageId) {
      await ctx.storage.delete(existingStaff.storageId);
    }

    // 関連するユーザーを削除
    if (existingStaff.userId) {
      await ctx.db.delete(existingStaff.userId);
    }

    // スタッフ情報を削除
    await ctx.db.delete(staffId);
  },
});

// 店舗IDに基づいてスタッフとそのユーザー情報を取得するクエリ
export const getStaffsWithUsers = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const staffs = await ctx.db
      .query("staffs")
      .withIndex("by_store_id", (q) => q.eq("storeId", args.storeId))
      .collect();

    const staffsWithUsers = await Promise.all(
      staffs.map(async (staff) => {
        const user = await ctx.db.get(staff.userId);
        if (!user) {
          // ユーザーが見つからない場合はスキップするか、エラーをログに記録
          console.warn(`User with ID ${staff.userId} not found for staff ${staff._id}`);
          return null;
        }

        // storageId から imageUrl を動的に生成
        const imageUrl = staff.storageId
          ? await ctx.storage.getUrl(staff.storageId)
          : staff.imageUrl;

        return { ...staff, user, imageUrl: imageUrl ?? undefined };
      }),
    );

    // null を除外して返す
    return staffsWithUsers.filter(Boolean);
  },
});

// 特定のスタッフを取得するクエリ
export const getStaff = query({
  args: {
    staffId: v.id("staffs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.staffId);
  },
});