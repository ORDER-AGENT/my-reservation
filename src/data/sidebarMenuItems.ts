import { FaFigma, FaGithub } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi2';
import { IoNotifications } from 'react-icons/io5';
import { TiHome } from 'react-icons/ti';
import { RiCalendarScheduleFill, RiDashboardHorizontalFill, RiSettings5Fill } from 'react-icons/ri';
import { BsChatDotsFill } from 'react-icons/bs';
import { SidebarMenuItemType } from '@/types/sidebar';

export const allMenuItems: SidebarMenuItemType[] = [
  // 顧客向けメニュー
  {
    type: 'item',
    key: 'customer-dashboard',
    icon: TiHome,
    text: 'ホーム',
    path: '/',
    displayInFooter: true,
    // roles: ['customer'],
  },
  {
    type: 'item',
    key: 'customer-reservation',
    icon: RiCalendarScheduleFill,
    text: '予約',
    path: '/customer/reservation/menu',
    displayInFooter: true,
    // roles: ['customer'],
  },
  {
    type: 'item',
    key: 'customer-mypage',
    icon: HiUsers,
    text: 'マイページ',
    path: '/customer/mypage',
    displayInFooter: true,
    // roles: ['customer'],
  },
  {
    type: 'item',
    key: 'customer-reviews',
    icon: BsChatDotsFill,
    text: '口コミ',
    path: '/customer/reviews',
    displayInFooter: true,
    // roles: ['customer'],
  },
  {
    type: 'divider',
    key: 'scope-divider',
  },
  // 店舗スタッフ・管理者向けメニュー
  {
    type: 'item',
    key: 'admin-dashboard',
    icon: RiDashboardHorizontalFill,
    text: 'ダッシュボード',
    path: '/admin',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-reservation-management',
    icon: RiCalendarScheduleFill,
    text: '予約管理',
    path: '/admin/schedule',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-schedule-management',
    icon: RiCalendarScheduleFill, // 必要に応じてアイコンを変更
    text: 'スケジュール管理',
    path: '/admin/staff-schedule',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-customer-management',
    icon: HiUsers,
    text: '顧客管理',
    path: '/admin/customers',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-settings',
    icon: RiSettings5Fill,
    text: '設定',
    path: '/admin/settings',
    displayInFooter: false,
    // roles: ['admin'],
  },
  {
    type: 'divider',
    key: 'external-divider',
  },
  {
    type: 'item',
    key: 'github',
    icon: FaGithub,
    text: 'GitHub',
    path: 'https://github.com/ORDER-AGENT/my-resavation',
    displayInFooter: false,
    isExternal: true,
  },
  {
    type: 'item',
    key: 'debug-page',
    icon: RiSettings5Fill,
    text: 'Debug',
    path: '/debug',
    displayInFooter: false,
  },
];

export const getSidebarMenuItems = (userRoles: string[]): SidebarMenuItemType[] => {
  // ユーザーのロールに基づいてメニュー項目をフィルタリング
  return allMenuItems.filter(item => {
    // ロールが設定されていない、または空配列の場合は常に表示
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // ユーザーのロールとメニュー項目のロールのいずれかが一致すれば表示
    return item.roles.some(role => userRoles.includes(role));
  });
};