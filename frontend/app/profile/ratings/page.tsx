import type { Metadata } from "next";

import { ProfileArchivePage } from "@/features/profile/ProfileArchivePage";

export const metadata: Metadata = {
  title: "الأماكن التي قيّمتها | سجل",
  description: "استعرض أرشيف الأماكن التي قيّمتها في سجل."
};

export default function ProfileRatingsPage() {
  return <ProfileArchivePage mode="archive" />;
}
