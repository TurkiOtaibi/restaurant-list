import Link from "next/link";
import type { ReactNode } from "react";

import type { UserList } from "@/lib/api";
import { cx } from "@/lib/ui";

import { Badge } from "./Badge";
import { BidiText } from "./BidiText";
import { Card, CardLink } from "./Card";

type ListCardProps = {
  actions?: ReactNode;
  context?: "owner" | "viewer";
  href?: string;
  isEmpty?: boolean;
  list: Pick<UserList, "id" | "name" | "visibility" | "updatedAt">;
  placeCount?: number;
};

export function ListCard({
  actions,
  context = "owner",
  href,
  isEmpty = false,
  list,
  placeCount = 0
}: ListCardProps) {
  const visibility = visibilityLabel(list.visibility);
  const count = placeCountLabel(placeCount);
  const accessibleName = `${list.name}، ${count}، ${visibility}${
    context === "viewer" ? "، عرض فقط" : ""
  }${isEmpty ? "، فارغة" : ""}`;

  const content = (
    <>
      <span className="ds-list-card__spine" aria-hidden="true" />
      <div className="ds-list-card__identity">
        <p className="ds-list-card__kicker">رف محفوظ</p>
        <h2 className="ds-list-card__title">
          {href && actions ? (
            <Link aria-label={accessibleName} className="ds-list-card__link" href={href}>
              <BidiText>{list.name}</BidiText>
            </Link>
          ) : (
            <BidiText>{list.name}</BidiText>
          )}
        </h2>
        <p className="ds-list-card__hint">
          {placeCount === 0 ? "جاهز لأول مكان يستحق التذكر" : "أماكن اخترتها لتعود إليها"}
        </p>
      </div>

      <div className="ds-list-card__meta" aria-hidden="true">
        <span className="ds-list-card__count">{count}</span>
        <Badge variant={list.visibility}>{visibility}</Badge>
        {context === "viewer" ? <span>عرض فقط</span> : null}
        {isEmpty ? <span>فارغة</span> : null}
      </div>

      {actions ? <div className="actions">{actions}</div> : null}
    </>
  );

  if (href && !actions) {
    return (
      <CardLink
        aria-label={accessibleName}
        className={cx("ds-list-card", isEmpty && "ds-list-card--empty")}
        href={href}
      >
        {content}
      </CardLink>
    );
  }

  return (
    <Card
      aria-label={accessibleName}
      className={cx("ds-list-card", isEmpty && "ds-list-card--empty")}
    >
      {content}
    </Card>
  );
}

function visibilityLabel(visibility: UserList["visibility"]): string {
  return visibility === "public" ? "عام" : "خاص";
}

function placeCountLabel(count: number): string {
  if (count === 0) {
    return "لا توجد أماكن";
  }

  if (count === 1) {
    return "مكان واحد";
  }

  if (count === 2) {
    return "مكانان";
  }

  return `${count} أماكن`;
}
