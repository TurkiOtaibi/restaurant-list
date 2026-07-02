import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/ui";

type ButtonVariant = "primary" | "secondary" | "destructive" | "icon";

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  destructive: "ds-button--destructive",
  icon: "ds-button--icon",
  primary: "",
  secondary: "ds-button--secondary"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: Exclude<ButtonVariant, "icon">;
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  loadingLabel = "جاري التحميل",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={cx("ds-button", variantClass(variant), className)}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true" className="ds-button__spinner" />
          <span aria-live="polite" className="sr-only" role="status">
            {loadingLabel}
          </span>
        </>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  href,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cx("ds-button", variantClass(variant), className)} href={href} {...props}>
      {children}
    </Link>
  );
}

function variantClass(variant: ButtonVariant): string {
  return BUTTON_VARIANT_CLASSES[variant];
}
