import Link from "next/link";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/ui";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

type CardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <article className={cx("ds-card", className)} {...props}>
      {children}
    </article>
  );
}

export function CardLink({ children, className, href, ...props }: CardLinkProps) {
  return (
    <Link className={cx("ds-card ds-card--interactive", className)} href={href} {...props}>
      {children}
    </Link>
  );
}
