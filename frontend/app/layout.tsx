import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Suspense } from "react";
import { AppNav } from "@/components/AppNav";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { PwaServiceWorkerRegistrar } from "@/components/PwaServiceWorkerRegistrar";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  display: "swap",
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  weight: ["400", "500", "600", "700"]
});

const siteName = "سجل";
const siteTitle = "سجل | Restaurant List";
const siteDescription = "سجل شخصي للأماكن: قيّم المطاعم والمقاهي والآيس كريم، واحفظ قوائمك ومفضلتك ورغباتك.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restaurant-list-web.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: "%s"
  },
  description: siteDescription,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "/",
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "شعار سجل"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: ["/icon-512.png"]
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
        <a className="skip-link" href="#main-content">
          تجاوز إلى المحتوى
        </a>
        <Suspense fallback={null}>
          <AppNav />
        </Suspense>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <InstallAppPrompt />
        <PwaServiceWorkerRegistrar />
      </body>
    </html>
  );
}
