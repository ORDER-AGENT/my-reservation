import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 店舗情報を格納するテーブル
  stores: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    // 曜日ごとの営業時間を格納するフィールド
    openingHours: v.array(
      v.object({
        // 0: Sunday, 1: Monday, ..., 6: Saturday
        dayOfWeek: v.number(),
        startTime: v.string(), // "HH:mm"
        endTime: v.string(), // "HH:mm"
      }),
    ),
    // 特定の休業日を格納（例: "2024-12-31"）
    specialHolidays: v.optional(v.array(v.string())),
  }),

  // ユーザー情報を格納するテーブル（顧客、スタッフ、管理者）
  users: defineTable({
    // NextAuth.jsから提供される可能性があるため、nameはoptional
    name: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
    // Convexの認証機能やNextAuth.jsと連携するためのフィールド
    tokenIdentifier: v.string(),
    hashedPassword: v.optional(v.string()), // メールアドレスとパスワード認証用
    // ユーザーの役割
    role: v.union(
      v.literal("customer"),
      v.literal("staff"),
      v.literal("admin"),
    ),
    // スタッフや管理者の場合、所属する店舗ID
    storeId: v.optional(v.id("stores")),
  })
    // emailとtokenIdentifierはユニークであるべきなのでインデックスを張る
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  // スタッフの詳細情報を格納するテーブル
  staffs: defineTable({
    // usersテーブルと1対1で紐づく
    userId: v.id("users"),
    storeId: v.id("stores"),
    // 役職（例: スタイリスト、ネイリスト）
    title: v.optional(v.string()),
    // 自己紹介
    bio: v.optional(v.string()),
    // プロフィール画像のURL
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  })
    .index("by_user_id", ["userId"])
    .index("by_store_id", ["storeId"]),

  // 施術メニューを格納するテーブル
  services: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    description: v.optional(v.string()),
    // 価格（円）
    price: v.number(),
    // 施術時間（分）
    duration: v.number(),
    // カテゴリ（例: カット, カラー）
    category: v.string(),
    // メニューが現在提供中かどうか
    isActive: v.boolean(),
    // 画像URL
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  }).index("by_store_id", ["storeId"]),

  // 予約情報を格納するテーブル
  reservations: defineTable({
    // 予約した顧客 (ゲスト予約の場合はoptional)
    customerId: v.optional(v.id("users")),
    // ゲスト予約の場合の顧客情報
    guestName: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    guestPhone: v.optional(v.string()),
    // 予約番号
    reservationNumber: v.optional(v.string()),
    staffId: v.id("staffs"),
    serviceId: v.id("services"),
    storeId: v.id("stores"),
    // 予約日時（Unixタイムスタンプ ms）
    dateTime: v.number(),
    // 予約のステータス
    status: v.union(
      v.literal("reserved"),      // 予約
      v.literal("in-progress"),   // 対応中
      v.literal("canceled"),      // キャンセル
      v.literal("completed")      // 完了
    ),
    // 予約時点での合計料金と所要時間
    totalPrice: v.number(),
    totalDuration: v.number(),
    // 顧客からのメモ
    notes: v.optional(v.string()),
  })
    .index("by_customer_id", ["customerId"])
    .index("by_staff_and_time", ["staffId", "dateTime"])
    .index("by_store_and_time", ["storeId", "dateTime"])
    .index("by_reservation_number", ["reservationNumber"]),

  // スタッフの勤務スケジュールを格納するテーブル
  schedules: defineTable({
    staffId: v.id("staffs"),
    // 曜日ごとの勤務時間を格納するフィールド
    workingHours: v.array(
      v.object({
        // 0: Sunday, 1: Monday, ..., 6: Saturday
        dayOfWeek: v.number(),
        startTime: v.string(), // "HH:mm"
        endTime: v.string(), // "HH:mm"
      }),
    ),
    // 特定の休業日を格納（例: "2024-12-31"）
    specialHolidays: v.optional(v.array(v.string())),
    // 特定の営業日を格納
    specialWorkdays: v.optional(
      v.array(
        v.object({
          date: v.string(), // "YYYY-MM-DD"
          startTime: v.string(), // "HH:mm"
          endTime: v.string(), // "HH:mm"
        }),
      ),
    ),
  }).index("by_staff_id", ["staffId"]),
/*
  // 口コミ情報を格納するテーブル
  reviews: defineTable({
    reservationId: v.id("reservations"),
    customerId: v.id("users"),
    staffId: v.id("staffs"),
    // 評価（5段階）
    rating: v.number(),
    comment: v.optional(v.string()),
  })
    .index("by_reservation_id", ["reservationId"])
    .index("by_staff_id", ["staffId"]),

  // 顧客のお気に入りスタッフを管理する中間テーブル
  favoriteStaffs: defineTable({
    customerId: v.id("users"),
    staffId: v.id("staffs"),
  })
    // 複合インデックスで顧客とスタッフの組み合わせの重複を防ぐ
    .index("by_customer_and_staff", ["customerId", "staffId"]),

  */
});