import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { bundleMDX } from 'mdx-bundler';

type Doc = {
  slug: string;
  title: string;
};

export default async function DocsListPage() {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = fs.readdirSync(docsDir);

  const docs: Doc[] = [];

  for (const file of files) {
    const source = fs.readFileSync(path.join(docsDir, file), 'utf-8');

    // frontmatter をパース
    const { frontmatter } = await bundleMDX({ source });
    if (frontmatter?.slug && frontmatter?.title) {
      docs.push({
        slug: frontmatter.slug,
        title: frontmatter.title,
      });
    }
  }

  return (
    <div className="prose p-4">
      <h2>設計書一覧</h2>
      <ul>
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/docs/${doc.slug}`}>{doc.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
