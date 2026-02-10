import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadTube - YouTubeを記事として読む",
  description: "AIが動画を解析し、プロのライターが書いたような日本語レポートをメールでお届けします",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
