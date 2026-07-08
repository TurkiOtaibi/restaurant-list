import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تقييم مكان | سجل",
  description: "أضف أو حدّث تقييمك لمكان داخل سجل."
};

export default function RatePlaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
