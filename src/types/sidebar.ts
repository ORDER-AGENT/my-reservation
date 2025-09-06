import { IconType } from 'react-icons';

export interface MenuItem {
  type: 'item';
  key: string;
  icon: IconType | string;
  text: string;
  path?: string;
  roles?: string[];
  displayInFooter?: boolean;
  isExternal?: boolean;
  loggedOutOnly?: boolean;
  children?: MenuItem[];
  onClick?: () => void;
}

export interface Divider {
  type: 'divider';
  key: string;
  roles?: string[];
  loggedOutOnly?: boolean;
}

export type SidebarMenuItemType = MenuItem | Divider; 