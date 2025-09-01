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
  avatarUrl: string;
};

export type LastReservation = {
  menus: ServiceMenu[];
  staff: Staff | null;
  timestamp: string;
};

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}