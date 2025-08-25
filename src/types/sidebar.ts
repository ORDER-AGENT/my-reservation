import { IconType } from 'react-icons';

export interface MenuItem {
  type: 'item';
  key: string;
  icon: IconType | string;
  text: string;
  path: string;
  roles?: string[];
  displayInFooter?: boolean;
  isExternal?: boolean;
}

export interface Divider {
  type: 'divider';
  key: string;
  roles?: string[];
}

export type SidebarMenuItemType = MenuItem | Divider; 