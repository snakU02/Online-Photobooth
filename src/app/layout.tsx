import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DuoSnap - Romantic Couple Photobooth Studio",
  description: "Capture unforgettable couple memories with unique themes, life4cuts photo strips, automated pose guides, sticker decorators, and instant QR sharing.",
  keywords: ["couple photobooth", "online photobooth", "life4cuts", "romantic photo strip", "couple pose ideas", "photobooth app"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-pink-300 selection:text-pink-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
