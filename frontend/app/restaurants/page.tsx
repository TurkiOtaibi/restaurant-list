import { redirect } from "next/navigation";

export default function RestaurantsPage() {
  redirect("/places?type=restaurant");
}
