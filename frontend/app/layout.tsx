import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "سجل | Restaurant List",
  description: "سجل شخصي للأماكن"
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
