import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "المقاهي | سجل",
  description: "انتقل إلى قائمة المقاهي داخل سجل الأماكن."
};

export default function CafesPage() {
  redirect("/places?type=cafe");
}
