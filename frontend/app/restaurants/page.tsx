import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "المطاعم | سجل",
  description: "انتقل إلى قائمة المطاعم داخل سجل الأماكن."
};

export default function RestaurantsPage() {
  redirect("/places?type=restaurant");
}
