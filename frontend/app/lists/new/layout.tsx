import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إضافة قائمة | سجل",
  description: "أنشئ قائمة جديدة للأماكن داخل سجل."
};

export default function NewListLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
