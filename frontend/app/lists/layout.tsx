import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوائمي | سجل",
  description: "إدارة قوائم الأماكن الخاصة بك داخل سجل."
};

export default function ListsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
