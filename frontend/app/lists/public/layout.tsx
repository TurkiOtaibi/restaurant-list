import type { Metadata } from "next";

const publicListsDescription = "استعرض القوائم العامة للأماكن في سجل واكتشف اختيارات منشورة من المجتمع.";

export const metadata: Metadata = {
  title: "القوائم العامة | سجل",
  description: publicListsDescription,
  alternates: { canonical: "/lists/public" },
  openGraph: {
    title: "القوائم العامة | سجل",
    description: publicListsDescription,
    url: "/lists/public",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "شعار سجل" }]
  },
  twitter: {
    card: "summary",
    title: "القوائم العامة | سجل",
    description: publicListsDescription,
    images: ["/icon-512.png"]
  }
};

export default function PublicListsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
