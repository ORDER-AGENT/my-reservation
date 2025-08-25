import ContentLayout from '@/components/layout/ContentLayout';
import React from 'react';


// ヘッダー
const createHeader = () => {
  return (
		<div className="p-4">
			<h1 className="text-xl font-bold">固定ヘッダー</h1>
		</div>
  );
};

// フッター
const createFooter = () => {
  return (
		<div className="p-4">
			<p className="text-center">固定フッター</p>
		</div>
  );
};

const SamplePage = () => {
  const dummyContent = Array.from({ length: 100 }, (_, i) => (
    <p key={i} className="mb-2">
      ダミーコンテンツ {i + 1}
    </p>
  ));

  return (
    <ContentLayout
      headerContent={createHeader()}
      isHeaderFixed={true}
      footerContent={createFooter()}
      isFooterFixed={true}
    >
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">スクロール可能コンテンツ</h2>
        {dummyContent}
        <h2 className="text-2xl font-bold mb-4">スクロール可能コンテンツ</h2>
      </div>
    </ContentLayout>
  );
};

export default SamplePage;
