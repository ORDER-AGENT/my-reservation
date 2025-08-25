import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "@/components/layout/RootLayoutClient";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Reservation",
  description: "A reservation system for small businesses.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // サーバーサイドでCookieを読み取り、サイドバーの初期状態を決定
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebarOpenState');

  // Cookieが存在すればその値を、なければデフォルトでtrue（開いた状態）とする
  const initialIsMenuOpen = sidebarCookie ? sidebarCookie.value === 'true' : true;

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootLayoutClient initialIsMenuOpen={initialIsMenuOpen}>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
