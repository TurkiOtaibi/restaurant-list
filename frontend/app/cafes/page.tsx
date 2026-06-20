import { redirect } from "next/navigation";

export default function CafesPage() {
  redirect("/places?type=cafe");
}
