import type { ServiceMenu, Staff } from '@/types/data';

export const serviceMenus: ServiceMenu[] = [
  { id: 'cut', name: 'カット', description: 'シャンプー・ブロー込み', price: 4500, duration: 60, imageUrl: '/placeholder-image?width=64&height=64&background=rgb(96, 91, 255)&color=white' },
  { id: 'color', name: 'カラー', description: 'リタッチカラー', price: 5000, duration: 90, imageUrl: '/placeholder-image?width=64&height=64&background=rgb(96, 91, 255)&color=white' },
  { id: 'perm', name: 'パーマ', description: 'デジタルパーマ', price: 8000, duration: 120, imageUrl: '/placeholder-image?width=64&height=64&background=rgb(96, 91, 255)&color=white' },
  { id: 'treatment', name: 'トリートメント', description: '保湿トリートメント', price: 3000, duration: 30, imageUrl: '/placeholder-image?width=64&height=64&background=rgb(96, 91, 255)&color=white' },
];

export const staffList: Staff[] = [
  { id: 'sato', name: '佐藤', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(255, 91, 91)&color=white&text=Sato' },
  { id: 'suzuki', name: '鈴木', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(91, 255, 91)&color=white&text=Suzuki' },
  { id: 'takahashi', name: '高橋', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(91, 91, 255)&color=white&text=Takahashi' },
  { id: 'tanaka', name: '田中', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(255, 165, 0)&color=white&text=Tanaka' },
  { id: 'yamada', name: '山田', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(0, 128, 0)&color=white&text=Yamada' },
  { id: 'watanabe', name: '渡辺', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(128, 0, 128)&color=white&text=Watanabe' },
  { id: 'itou', name: '伊藤', avatarUrl: '/placeholder-image?width=64&height=64&background=rgb(0, 0, 128)&color=white&text=Itou' },
];
