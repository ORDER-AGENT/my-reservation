import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AppLogo() {
  return (
    <Link href="/">
      <div className="relative w-[120px] ml-0">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={0}
          height={0}
          sizes="100%"
          className="w-full h-auto"
          unoptimized={true}
        />
      </div>
    </Link>
  );
}
