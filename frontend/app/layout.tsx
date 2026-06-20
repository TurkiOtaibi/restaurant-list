import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ذوق | Restaurant Wishlist Tracker",
  description: "Arabic-first restaurant and cafe taste library"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html dir="rtl" lang="ar">
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
