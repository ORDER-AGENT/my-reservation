import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const hashPassword = internalAction({
  args: {
    password: v.string(),
  },
  handler: async (_, { password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  },
});

export const verifyPassword = internalAction({
  args: {
    password: v.string(),
    hashedPassword: v.string(),
  },
  handler: async (_, { password, hashedPassword }) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  },
});
