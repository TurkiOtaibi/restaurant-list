import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تفاصيل القائمة | سجل",
  description: "استعرض تفاصيل قائمة الأماكن وعناصرها داخل سجل."
};

export default function ListDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
