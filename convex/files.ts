import { mutation, action } from "./_generated/server";
import { v } from "convex/values";

/**
 * 画像ファイルをアップロードするためのURLを生成します。
 * クライアントはこのURLを使用して、生成されたURLにPUTリクエストでファイルを直接アップロードします。
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * ファイルが正常にアップロードされた後に呼び出されます。
 * アップロードされたファイルのメタデータをConvexデータベースに登録します。
 */
export const afterUpload = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    return imageUrl;
  },
});