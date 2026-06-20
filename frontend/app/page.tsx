import Link from "next/link";

export default function Home() {
  return (
    <main className="content">
      <section className="auth-card" aria-labelledby="page-title">
        <p className="eyebrow">ذوق</p>
        <h1 id="page-title">مكتبة ذوقك الشخصية</h1>
        <p className="muted">ابدأ من قوائمك، ثم أضف المطاعم والمقاهي التي تستحق أن تبقى.</p>
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
