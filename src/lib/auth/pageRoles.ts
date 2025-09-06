import { UserRole } from '@/types/user';

/**
 * 各ページへのアクセス権限定義
 */
export type PageAccessDef = {
  /** 読み書きを許可するロール */
  readWrite: UserRole[];
  /** 読み取り専用を許可するロール */
  readOnly: UserRole[];
};

/**
 * 各ページへのアクセス権限ルール
 * keyはパスの正規表現
 */
export const pageAccessDefs: { [pathRegex: string]: PageAccessDef } = {
  '^/admin.*': {
    readWrite: ['admin'],
    readOnly: ['staff'], // staffは読み取り専用でadminページにアクセス可能
  },
  '^/staff.*': {
    readWrite: ['admin', 'staff'],
    readOnly: [],
  },
  '^/customer.*': {
    readWrite: ['customer', 'guest'],
    readOnly: [],
    //readOnly: ['staff', 'admin'],
  },
  '^/$': { // ルートページに対するアクセス権限
    readWrite: ['customer', 'guest'],
    readOnly: [],
  },
  // 他のページのルール...
};

/**
 * 指定されたパスのアクセス権限定義を取得する
 * @param path - 現在のページのパス
 * @returns 権限定義。ルールがなければundefined
 */
export const getPageAccessDef = (path: string): PageAccessDef | undefined => {
  for (const pathRegex in pageAccessDefs) {
    if (new RegExp(pathRegex).test(path)) {
      return pageAccessDefs[pathRegex];
    }
  }
  return undefined;
};
