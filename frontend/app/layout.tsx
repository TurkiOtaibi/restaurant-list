import type { Metadata, Viewport } from "next";
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
  description: "سجل شخصي للأماكن",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "سجل"
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#090e16",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
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
