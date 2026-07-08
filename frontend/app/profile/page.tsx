import type { Metadata } from "next";

import { ProfileArchivePage } from "@/features/profile/ProfileArchivePage";

export const metadata: Metadata = {
  title: "صفحتي | سجل",
  description: "راجع هويتك في سجل وتقييماتك ومفضلتك وقوائمك."
};

export default function ProfilePage() {
  return <ProfileArchivePage />;
}
