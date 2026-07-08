import { ButtonLink, TasteMarkIcon } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="content not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <span className="not-found-card__mark" aria-hidden="true">
          <TasteMarkIcon />
        </span>
        <p className="eyebrow">٤٠٤</p>
        <h1 id="not-found-title">لم نجد هذه الصفحة</h1>
        <p className="not-found-card__body">
          الرابط قد يكون تغيّر أو أن الصفحة لم تعد متاحة. يمكنك الرجوع للأماكن أو استكشاف القوائم العامة.
        </p>
        <div className="not-found-card__actions">
          <ButtonLink href="/places">العودة إلى الأماكن</ButtonLink>
          <ButtonLink href="/lists/public" variant="secondary">
            القوائم العامة
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
