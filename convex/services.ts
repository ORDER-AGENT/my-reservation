import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// サービスメニューを全件取得するクエリ
export const get = query({
  args: {
    storeId: v.id('stores'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_store_id', q => q.eq('storeId', args.storeId))
      .collect();
  },
});

// サービスメニューをIDで取得するクエリ
export const getById = query({
  args: {
    id: v.id('services'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// サービスメニューを追加するミューテーション
export const create = mutation({
  args: {
    storeId: v.id('stores'),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    duration: v.number(),
    category: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const newServiceMenuId = await ctx.db.insert('services', {
      storeId: args.storeId,
      name: args.name,
      description: args.description,
      price: args.price,
      duration: args.duration,
      category: args.category,
      isActive: args.isActive,
    });
    return newServiceMenuId;
  },
});

// サービスメニューを更新するミューテーション
export const update = mutation({
  args: {
    id: v.id('services'),
    storeId: v.id('stores'),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    duration: v.number(),
    category: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

// サービスメニューを削除するミューテーション
export const remove = mutation({
  args: {
    id: v.id('services'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
