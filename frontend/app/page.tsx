import Link from "next/link";

import { StatusMessage } from "@/components/ui";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ logout?: string | string[] }>;
}) {
  const params = await searchParams;
  const logoutUnconfirmed = params.logout === "unconfirmed";

  return (
    <main className="content">
      <section className="auth-card" aria-labelledby="page-title">
        <p className="eyebrow">سجل</p>
        <h1 id="page-title">سجل الأماكن</h1>
        <p className="muted">أنشئ قوائمك وأضف الأماكن.</p>
        {logoutUnconfirmed ? (
          <StatusMessage tone="notice">
            تعذر تأكيد تسجيل الخروج من الخادم. تم مسح الجلسة محليًا.
          </StatusMessage>
        ) : null}
        <div className="actions">
          <Link className="ds-button" href="/register">
            إنشاء حساب
          </Link>
          <Link className="ds-button ds-button--secondary" href="/login">
            تسجيل الدخول
          </Link>
        </div>
      </section>
    </main>
  );
}
