import { action, internalAction, mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * 登録されているユーザーの総数を取得する
 */
export const getUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users.length;
  },
});


// DB にユーザーを挿入する mutation
export const insertUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    hashedPassword: v.string(),
    role: v.union(v.literal("customer"), v.literal("staff"), v.literal("admin")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      hashedPassword: args.hashedPassword,
      tokenIdentifier: `https://${process.env.CONVEX_URL}|${args.email}`,
      role: args.role,
      storeId: args.storeId,
    });
    return userId;
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return user;
  },
});

export const createUser = action({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("customer"), v.literal("staff"), v.literal("admin")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const existingUser = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });
    if (existingUser) throw new Error("User already exists.");

    // internalAction を呼び出してハッシュ化
    const hashedPassword = await ctx.runAction(internal.auth.hashPassword, {
      password: args.password,
    });


    const userId: Id<"users"> = await ctx.runMutation(api.users.insertUser, {
      name: args.name,
      email: args.email,
      hashedPassword,
      role: args.role,
      storeId: args.storeId,
    });

    return userId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("customer"), v.literal("staff"), v.literal("admin"))),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const { userId, ...rest } = args;
    await ctx.db.patch(userId, rest);
  },
});

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUserHashedPassword = mutation({
  args: {
    userId: v.id("users"),
    hashedPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      hashedPassword: args.hashedPassword,
    });
  },
});

export const updateUserPassword = action({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, currentPassword, newPassword } = args;

    const user = await ctx.runQuery(api.users.getUser, { userId });
    if (!user) {
      throw new Error("User not found.");
    }

    // hashedPassword が存在することを確認
    if (user.hashedPassword === undefined) {
      throw new Error("User does not have a password set.");
    }
    
    // 現在のパスワードを検証
    const isMatch = await ctx.runAction(internal.auth.verifyPassword, {
      password: currentPassword,
      hashedPassword: user.hashedPassword,
    });

    if (!isMatch) {
      throw new Error("Invalid current password.");
    }

    // 新しいパスワードをハッシュ化
    const newHashedPassword = await ctx.runAction(internal.auth.hashPassword, {
      password: newPassword,
    });

    // パスワードを更新
    await ctx.runMutation(api.users.updateUserHashedPassword, {
      userId,
      hashedPassword: newHashedPassword,
    });
  },
});

