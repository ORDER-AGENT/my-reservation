import { FaGithub } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi2';
import { IoDocumentsSharp } from 'react-icons/io5';
import { TiHome } from 'react-icons/ti';
import {
  RiCalendarScheduleFill,
  RiDashboardHorizontalFill,
  RiFileList2Line,
  RiSettings5Fill,
  RiStore2Line,
} from 'react-icons/ri';
//import { BsChatDotsFill } from 'react-icons/bs';
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
    path: '/customer/reservation',
    displayInFooter: true,
    // roles: ['customer'],
  },
  {
    type: 'item',
    key: 'customer-mypage',
    icon: HiUsers,
    text: '🚧マイページ',
    //path: '/customer/mypage',
    path: '/under-construction',
    displayInFooter: true,
    // roles: ['customer'],
  },
  /*
  {
    type: 'item',
    key: 'customer-reviews',
    icon: BsChatDotsFill,
    text: '口コミ',
    path: '/customer/reviews',
    displayInFooter: true,
    // roles: ['customer'],
  },*/
  {
    type: 'divider',
    key: 'scope-divider',
  },
  // 店舗スタッフ・管理者向けメニュー
  {
    type: 'item',
    key: 'admin-dashboard',
    icon: RiDashboardHorizontalFill,
    text: '🚧ダッシュボード',
    //path: '/admin',
    path: '/under-construction',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-reservation-management',
    icon: RiCalendarScheduleFill,
    text: '🚧予約管理',
    //path: '/admin/schedule',
    path: '/under-construction',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-schedule-management',
    icon: RiCalendarScheduleFill, // 必要に応じてアイコンを変更
    text: '🚧スケジュール管理',
    //path: '/admin/staff-schedule',
    path: '/under-construction',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-customer-management',
    icon: HiUsers,
    text: '🚧顧客管理',
    //path: '/admin/customers',
    path: '/under-construction',
    displayInFooter: true,
    // roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-settings',
    icon: RiSettings5Fill,
    text: '🚧設定',
    //path: '/admin/settings',
    displayInFooter: false,
    // roles: ['admin'],
    children: [
      {
        type: 'item',
        key: 'admin-settings-store',
        icon: RiStore2Line,
        text: '🚧店舗情報登録',
        path: '/under-construction',
        // roles: ['admin'],
      },
      {
        type: 'item',
        key: 'admin-settings-service-menu',
        icon: RiFileList2Line,
        text: '🚧サービスメニュー登録',
        path: '/under-construction',
        // roles: ['admin'],
      },
    ],
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
    path: 'https://github.com/ORDER-AGENT/my-reservation',
    displayInFooter: false,
    isExternal: true,
  },
  {
    type: 'item',
    key: 'docs',
    icon: IoDocumentsSharp, // docs に適したアイコンがないため仮で設定
    text: 'ドキュメント',
    path: '/docs',
    displayInFooter: false,
    isExternal: false,
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