import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إضافة مكان | سجل",
  description: "أضف مكانًا جديدًا إلى سجل الأماكن."
};

export default function NewPlaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
