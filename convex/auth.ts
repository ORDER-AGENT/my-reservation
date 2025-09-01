import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("customer"), v.literal("staff"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(args.password, 10); // ソルトラウンドは10

    const userId = await ctx.db.insert("users", {
      email: args.email,
      hashedPassword: hashedPassword,
      tokenIdentifier: `https://${process.env.CONVEX_URL}|${args.email}`, // 仮のtokenIdentifier
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
