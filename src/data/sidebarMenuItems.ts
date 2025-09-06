import { FaGithub } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi2';
import { TbLogin2, TbLogout2 } from 'react-icons/tb';
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
import { signIn, signOut } from "next-auth/react";

export const allMenuItems: SidebarMenuItemType[] = [
  // 顧客向けメニュー
  {
    type: 'item',
    key: 'customer-dashboard',
    icon: TiHome,
    text: 'ホーム',
    path: '/',
    displayInFooter: true,
    roles: ['customer', 'guest'],
  },
  {
    type: 'item',
    key: 'customer-reservation',
    icon: RiCalendarScheduleFill,
    text: '予約',
    path: '/customer/reservation',
    displayInFooter: true,
    roles: ['customer', 'guest'],
  },
  {
    type: 'item',
    key: 'customer-mypage',
    icon: HiUsers,
    text: '🚧マイページ',
    //path: '/customer/mypage',
    path: '/under-construction',
    displayInFooter: true,
    roles: ['customer', 'guest'],
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
    roles: ['customer', 'guest'],
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
    roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-reservation-management',
    icon: RiCalendarScheduleFill,
    text: '予約管理',
    path: '/staff/reservations',
    displayInFooter: true,
    roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-schedule-management',
    icon: RiCalendarScheduleFill, // 必要に応じてアイコンを変更
    text: 'スケジュール管理',
    path: '/staff/schedule',
    displayInFooter: true,
    roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-customer-management',
    icon: HiUsers,
    text: '🚧顧客管理',
    //path: '/admin/customers',
    path: '/under-construction',
    displayInFooter: true,
    roles: ['admin', 'staff'],
  },
  {
    type: 'item',
    key: 'admin-settings',
    icon: RiSettings5Fill,
    text: '設定',
    //path: '/admin/settings',
    displayInFooter: false,
    roles: ['admin', 'staff'],
    children: [
      {
        type: 'item',
        key: 'admin-settings-store',
        icon: RiStore2Line,
        text: '店舗情報登録',
        path: '/admin/settings/store',
      },
      {
        type: 'item',
        key: 'admin-settings-service-menu',
        icon: RiFileList2Line,
        text: 'サービスメニュー登録',
        path: '/admin/settings/service-menu',
      },
      {
        type: 'item',
        key: 'admin-settings-staff',
        icon: HiUsers,
        text: 'スタッフ登録',
        path: '/admin/settings/staff',
      },
    ],
  },
  {
    type: 'divider',
    key: 'external-divider',
    roles: ['admin', 'staff'],
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
  {
    type: 'item',
    key: 'login',
    icon: TbLogin2,
    text: 'ログイン',
    path: '/auth/signin',
    displayInFooter: false,
    isExternal: false,
    loggedOutOnly: true,
  },
  {
    type: 'item',
    key: 'login-as-staff',
    icon: TbLogin2,
    text: 'スタッフとしてログイン',
    path: '#',
    displayInFooter: false,
    isExternal: false,
    loggedOutOnly: true,
    onClick: async () => {
      try {
        await signIn("email-password", {
          email: "demo_staff@yoyaku.com",
          password: "demostaff",
          callbackUrl: "/", // ログイン成功後にリダイレクト
        });
      } catch (error) {
        console.error("Login as staff error:", error);
        alert("ログイン中にエラーが発生しました。");
      }
    }
  },
  {
    type: 'item',
    key: 'logout',
    icon: TbLogout2,
    text: 'ログアウト',
    path: '#',
    displayInFooter: false,
    isExternal: false,
    roles: ['customer', 'staff', 'admin'],
    onClick: async () => {
      console.log("[sidebarMenuItems] Logout button clicked");
      try {
        await signOut({ callbackUrl: "/" }); 
        // callbackUrl を指定すると、ログアウト後にそのURLへリダイレクト
      } catch (error) {
        console.error("Logout error:", error);
        alert("ログアウト中にエラーが発生しました。");
      }
    }
  },
];

export const getSidebarMenuItems = (userRoles: string[]): SidebarMenuItemType[] => {
  //console.log('getSidebarMenuItems Debug: userRoles =', userRoles);
  return allMenuItems.filter(item => {
    // loggedOutOnly が true のアイテムは、ログインしていない場合のみ表示
    if (item.loggedOutOnly) {
      // ユーザーがログアウトしているかどうかを厳密に判定
      // userRoles が ['guest'] の場合にのみログアウト状態とみなす
      const isLoggedOut = userRoles.length === 0 || userRoles.includes('guest');

      return isLoggedOut;
    }

    // ロールが設定されていない、または空配列の場合は常に表示
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    // ユーザーのロールとメニュー項目のロールのいずれかが一致すれば表示
    return item.roles.some(role => userRoles.includes(role));
  });
};