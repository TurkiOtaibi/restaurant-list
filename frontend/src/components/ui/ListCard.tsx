import Link from "next/link";
import type { ReactNode } from "react";

import type { UserList } from "@/lib/api";
import { listVisibilityLabel } from "@/lib/listVisibility";
import { placeCountLabel } from "@/lib/numerals";
import { cx } from "@/lib/ui";

import { BidiText } from "./BidiText";
import { Card, CardLink } from "./Card";
import { ShelfIcon } from "./Icon";

type ListCardProps = {
  actions?: ReactNode;
  context?: "owner" | "viewer";
  href?: string;
  isEmpty?: boolean;
  list: Pick<UserList, "id" | "name" | "ownerDisplayName" | "visibility" | "updatedAt">;
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
  const visibility = listVisibilityLabel(list.visibility);
  const count = placeCountLabel(placeCount);
  const owner = context === "viewer" ? `بواسطة: ${list.ownerDisplayName}` : "";
  const accessibleName = `${list.name}، ${count}، ${visibility}${
    context === "viewer" ? `، ${owner}، عرض فقط` : ""
  }${isEmpty ? "، فارغة" : ""}`;

  const content = (
    <>
      <span className="ds-type-icon" aria-hidden="true">
        <ShelfIcon />
      </span>
      <div className="ds-list-card__main">
        <h2 className="ds-list-card__title">
          {href && actions ? (
            <Link aria-label={accessibleName} className="ds-list-card__link" href={href}>
              <BidiText>{list.name}</BidiText>
            </Link>
          ) : (
            <BidiText>{list.name}</BidiText>
          )}
        </h2>
        <div className="ds-list-card__meta" aria-hidden="true">
          <span>{count}</span>
          <span>{visibility}</span>
          {owner ? <span>{owner}</span> : null}
          {context === "viewer" ? <span>عرض فقط</span> : null}
        </div>
      </div>
      {actions ? (
        <div className="ds-list-card__actions">{actions}</div>
      ) : (
        <span aria-hidden="true" className="ds-list-card__more">
          •••
        </span>
      )}
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
