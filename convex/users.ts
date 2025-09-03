import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { api } from "./_generated/api";
import bcrypt from "bcryptjs";
import { Id } from "./_generated/dataModel"; // Id 型をインポート

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
    email: v.string(),
    hashedPassword: v.string(),
    role: v.union(v.literal("customer"), v.literal("staff"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      hashedPassword: args.hashedPassword,
      tokenIdentifier: `https://${process.env.CONVEX_URL}|${args.email}`,
      role: args.role,
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
  args: { email: v.string(), password: v.string(), role: v.union(v.literal("customer"), v.literal("staff"), v.literal("admin")) },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const existingUser = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });
    if (existingUser) throw new Error("User already exists.");

    const hashedPassword = await bcrypt.hash(args.password, 10);
    const userId: Id<"users"> = await ctx.runMutation(api.users.insertUser, { email: args.email, hashedPassword, role: args.role });

    return userId;
  },
});
