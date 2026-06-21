import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  display: "swap",
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "سجل | Restaurant List",
  description: "سجل شخصي للأماكن"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={ibmPlexSansArabic.variable} dir="rtl" lang="ar">
      <body className={ibmPlexSansArabic.className}>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
