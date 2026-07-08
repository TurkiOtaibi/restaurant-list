import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | سجل",
  description: "سجّل الدخول إلى حسابك لمتابعة تقييم الأماكن وإدارة قوائمك."
};

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
