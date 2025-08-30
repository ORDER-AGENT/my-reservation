'use client';

import React, { useEffect, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button'; // shadcn/uiのButtonをインポート
import { Plus, Minus } from 'lucide-react'; // アイコンをインポート

type Props = {
  code: string;
};

// Mermaidの初期化はアプリケーション全体で一度だけ実行する
// これをコンポーネントの外に移動
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
  });
} catch (e) {
  console.error("Mermaid initialization failed", e);
}

const MermaidBlock: React.FC<Props> = ({ code }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [currentScale, setCurrentScale] = useState(1.0); // 拡大率の状態
  const id = `mermaid-svg-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        const { svg: svgCode } = await mermaid.render(id, code);
        // SVG文字列からwidthとheight属性を削除
        let modifiedSvgCode = svgCode.replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '');
        setSvg(modifiedSvgCode);
      } catch (error) {
        console.error("Failed to render Mermaid diagram:", error);
        setSvg(`<pre><code>${code}</code></pre>`);
      }
    };

    renderMermaid();
  }, [code, id]);

  const handleZoomIn = () => {
    setCurrentScale((prevScale) => Math.min(prevScale + 0.2, 3.0)); // 最大3.0倍
  };

  const handleZoomOut = () => {
    setCurrentScale((prevScale) => Math.max(prevScale - 0.2, 0.4)); // 最小0.5倍
  };

  if (svg === null) {
    return <div>Loading diagram...</div>;
  }

  return (
    <div className="relative"> {/* ボタン配置のためにrelative */}
      <div className="absolute top-2 left-2 z-10 flex space-x-2"> {/* ボタンの配置 */}
        <Button size="icon" onClick={handleZoomIn}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" onClick={handleZoomOut}>
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      <div
        style={{
          overflowX: 'auto',
          transform: `scale(${currentScale})`, // 拡大率を適用
          transformOrigin: 'top left',
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

export default MermaidBlock;
