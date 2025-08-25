import React from 'react';
import { HiMenu  } from 'react-icons/hi';

// MenuToggleButtonコンポーネントのPropsの型定義
interface MenuToggleButtonProps {
  onClick: () => void; // クリックハンドラ
}

export default function MenuToggleButton({ onClick }: MenuToggleButtonProps) {
  // ボタンの基本スタイル
  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#606060', // デフォルトのテキスト色をグレーに
    height: '60px', // 高さを固定
    width: '60px', // 幅を固定
    borderRadius: '50%', // 初期は円形
    position: 'relative', // 擬似要素のためにrelativeを設定
    overflow: 'hidden', // 角丸がはみ出さないように設定
    outline: 'none', // フォーカス時のアウトラインをなくす
    border: 'none', // ボーダーをなくす
    padding: 0, // パディングをなくす
  };

  // ホバー時の擬似要素のスタイル
  const hoverPseudoElementStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '40px', // 円の直径
    height: '40px', // 円の高さ
    backgroundColor: '#e0f2fe', // ホバー時の背景色
    borderRadius: '50%', // 円形
    transform: 'translate(-50%, -50%)',
    opacity: 0, // 初期状態では非表示
    transition: 'opacity 0.15s ease-in-out', // 透明度のトランジション
    zIndex: -1, // ボタンの背面に配置
  };

  // ホバー時に擬似要素の透明度を1にするスタイル
  const hoverStyle: React.CSSProperties = {
    opacity: 1,
  };

  const [isHovered, setIsHovered] = React.useState(false); // ホバー状態を管理

  return (
    <button
      style={buttonBaseStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HiMenu className="size-6" /> {/* Menuアイコンを表示 */}
      {/* ホバー時に表示する擬似要素 */}
      <div style={{ ...hoverPseudoElementStyle, ...(isHovered ? hoverStyle : {}) }} />
    </button>
  );
} 