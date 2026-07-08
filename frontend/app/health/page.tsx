import type { Metadata } from "next";

import { BaseSwitchPilot } from "@/components/ui/BaseSwitchPilot";

export const metadata: Metadata = {
  title: "حالة الواجهة | سجل",
  description: "صفحة تحقق داخلية من حالة واجهة سجل."
};

export default function HealthPage() {
  return (
    <main className="content">
      <section className="auth-card" aria-labelledby="health-title">
        <p className="eyebrow">Health</p>
        <h1 id="health-title">Frontend health OK</h1>
        <BaseSwitchPilot />
      </section>
    </main>
  );
}
