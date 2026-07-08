import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء حساب | سجل",
  description: "أنشئ حسابًا في سجل لحفظ الأماكن والقوائم والتقييمات."
};

export default function RegisterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
