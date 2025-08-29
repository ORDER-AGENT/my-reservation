import fs from 'fs';
import path from 'path';
import { bundleMDX } from 'mdx-bundler';
import { getMDXComponent } from 'mdx-bundler/client';
import React from 'react';

type Props = { params: Promise<{ slug: string }> };

export default async function DocPage({ params }: Props) {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = fs.readdirSync(docsDir);
  const { slug } = await params

  // slug から該当ファイルを探す
  const fileName = files.find((f) => {
    const source = fs.readFileSync(path.join(docsDir, f), 'utf-8');
    const match = source.match(/slug:\s*(\S+)/);
    return match?.[1] === slug;
  });

  if (!fileName) return <div>Not Found</div>;

  const filePath = path.join(docsDir, fileName);
  const source = fs.readFileSync(filePath, 'utf-8');

  // MDX をバンドル
  const { code } = await bundleMDX({ source });
  //const Component = new Function('React', `${code}; return MDXContent`)(React);
  const Component = getMDXComponent(code);

  return (
    <article className="prose p-4">
      <Component />
    </article>
  );
}
