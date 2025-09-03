import { UserRole } from '@/types/user';

/**
 * 各ページへのアクセスに必要なロールを定義
 * keyはパスの正規表現、valueは許可されるロールの配列
 */
export const pageRoles: { [pathRegex: string]: UserRole[] } = {
  '^/admin.*': ['admin'],
  '^/customer.*': ['customer', 'admin'],
  // 他のページのルール...
};

/**
 * 指定されたパスに必要なロールを取得する
 * @param path - 現在のページのパス
 * @returns 必要なロールの配列。ルールがなければundefined
 */
export const getRequiredRoles = (path: string): UserRole[] | undefined => {
  for (const pathRegex in pageRoles) {
    if (new RegExp(pathRegex).test(path)) {
      return pageRoles[pathRegex];
    }
  }
  return undefined;
};
