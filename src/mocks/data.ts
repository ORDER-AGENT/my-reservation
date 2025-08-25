export type ServiceMenu = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // 施術時間（分）
  imageUrl: string;
};

export type Staff = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export const serviceMenus: ServiceMenu[] = [
  { id: 'cut', name: 'カット', description: 'シャンプー・ブロー込み', price: 4500, duration: 60, imageUrl: '/placeholder-image?width=80&height=80&background=rgb(96, 91, 255)&color=white' },
  { id: 'color', name: 'カラー', description: 'リタッチカラー', price: 5000, duration: 90, imageUrl: '/placeholder-image?width=80&height=80&background=rgb(96, 91, 255)&color=white' },
  { id: 'perm', name: 'パーマ', description: 'デジタルパーマ', price: 8000, duration: 120, imageUrl: '/placeholder-image?width=80&height=80&background=rgb(96, 91, 255)&color=white' },
  { id: 'treatment', name: 'トリートメント', description: '保湿トリートメント', price: 3000, duration: 30, imageUrl: '/placeholder-image?width=80&height=80&background=rgb(96, 91, 255)&color=white' },
];

export const staffList: Staff[] = [
  { id: 'sato', name: '佐藤' },
  { id: 'suzuki', name: '鈴木' },
  { id: 'takahashi', name: '高橋' },
];
