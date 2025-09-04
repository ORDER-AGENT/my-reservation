import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// サービスメニューを全件取得するクエリ
export const get = query({
  args: {
    storeId: v.id('stores'),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query('services')
      .withIndex('by_store_id', q => q.eq('storeId', args.storeId))
      .collect();

    // storageId があれば imageUrl を動的に生成して返す
    return Promise.all(
      services.map(async (service) => {
        if (service.storageId) {
          const imageUrl = await ctx.storage.getUrl(service.storageId);
          return { ...service, imageUrl: imageUrl ?? undefined };
        }
        return service;
      })
    );
  },
});

// サービスメニューをIDで取得するクエリ
export const getById = query({
  args: {
    id: v.id('services'),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service) {
      return null;
    }
    // storageId があれば imageUrl を動的に生成して返す
    if (service.storageId) {
      const imageUrl = await ctx.storage.getUrl(service.storageId);
      return { ...service, imageUrl: imageUrl ?? undefined };
    }
    return service;
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
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
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
      imageUrl: args.imageUrl,
      storageId: args.storageId,
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
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;

    // 更新前のドキュメントを取得
    const existingService = await ctx.db.get(id);

    // storageId が変更された、または imageUrl が直接指定されて storageId が不要になった場合、古いファイルを削除
    if (existingService?.storageId && existingService.storageId !== args.storageId) {
      await ctx.storage.delete(existingService.storageId);
    }

    await ctx.db.patch(id, rest);
  },
});

// サービスメニューを削除するミューテーション
export const remove = mutation({
  args: {
    id: v.id('services'),
  },
  handler: async (ctx, args) => {
    // 削除前にドキュメントを取得して storageId を確認
    const service = await ctx.db.get(args.id);
    if (service?.storageId) {
      // ストレージからファイルを削除
      await ctx.storage.delete(service.storageId);
    }
    // データベースからドキュメントを削除
    await ctx.db.delete(args.id);
  },
});