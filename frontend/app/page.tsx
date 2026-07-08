import Link from "next/link";
import type { Metadata } from "next";

import { StatusMessage } from "@/components/ui";
import {
  ArchiveIcon,
  BookmarkIcon,
  RestaurantIcon,
  SearchIcon,
  ShelfIcon,
  TasteMarkIcon
} from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "سجل الأماكن | سجل",
  description: "استكشف الأماكن والقوائم العامة في سجل، ثم أنشئ حسابك لتقييم الأماكن وحفظ قوائمك ومفضلاتك."
};

const discoveryLinks = [
  {
    href: "/places?type=restaurant",
    icon: RestaurantIcon,
    title: "استكشف الأماكن",
    description: "ابدأ من كتالوج المطاعم والمقاهي والآيس كريم بدون تسجيل دخول."
  },
  {
    href: "/places?type=restaurant&focus=search",
    icon: SearchIcon,
    title: "ابحث بسرعة",
    description: "افتح البحث مباشرة عندما تعرف اسم المكان الذي تريده."
  },
  {
    href: "/lists/public",
    icon: ShelfIcon,
    title: "القوائم العامة",
    description: "تصفح قوائم منشورة من المجتمع لاكتشاف اختيارات جديدة."
  }
];

const privateHighlights = [
  { icon: ArchiveIcon, label: "قيّم الأماكن" },
  { icon: BookmarkIcon, label: "احفظ رغباتك" },
  { icon: ShelfIcon, label: "ابنِ قوائمك" }
];

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ logout?: string | string[] }>;
}) {
  const params = await searchParams;
  const logoutUnconfirmed = params.logout === "unconfirmed";

  return (
    <main className="content home-discovery">
      <section className="home-hero" aria-labelledby="page-title">
        <div className="home-hero__copy">
          <p className="eyebrow">سجل</p>
          <h1 id="page-title">سجل الأماكن</h1>
          <p className="muted">
            اكتشف أماكن تستحق الزيارة، تصفح القوائم العامة، ثم سجّل دخولك عندما تريد التقييم
            والحفظ وبناء ذائقتك.
          </p>
        </div>
        <div className="home-hero__mark" aria-hidden="true">
          <TasteMarkIcon />
        </div>
        {logoutUnconfirmed ? (
          <StatusMessage tone="notice">
            تعذر تأكيد تسجيل الخروج من الخادم. تم مسح الجلسة محليًا.
          </StatusMessage>
        ) : null}
        <div className="home-hero__actions">
          <Link className="ds-button" href="/places?type=restaurant">
            تصفح الأماكن
          </Link>
          <Link className="ds-button ds-button--secondary" href="/lists/public">
            القوائم العامة
          </Link>
        </div>
      </section>

      <section className="home-section" aria-labelledby="public-discovery-title">
        <div className="home-section__header">
          <h2 id="public-discovery-title">ابدأ بدون حساب</h2>
          <p>التصفح العام متاح، والأفعال الشخصية تبقى محمية بتسجيل الدخول.</p>
        </div>
        <div className="home-discovery-grid">
          {discoveryLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="home-discovery-card" href={item.href} key={item.href}>
                <span className="home-discovery-card__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="home-discovery-card__content">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-account-panel" aria-labelledby="account-title">
        <div className="home-section__header">
          <h2 id="account-title">عندما تريد حفظ ذائقتك</h2>
          <p>الحساب يفتح التقييمات، المفضلة، رغباتي، والقوائم الخاصة.</p>
        </div>
        <div className="home-private-list" aria-label="مزايا الحساب">
          {privateHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <span className="home-private-chip" key={item.label}>
                <Icon aria-hidden="true" />
                {item.label}
              </span>
            );
          })}
        </div>
        <div className="home-hero__actions">
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
