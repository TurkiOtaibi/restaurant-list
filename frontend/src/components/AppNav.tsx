"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ArchiveIcon, CafeIcon, RestaurantIcon, ShelfIcon, TasteMarkIcon } from "./ui/Icon";

const links = [
  { href: "/lists", icon: ShelfIcon, label: "قوائمي" },
  { href: "/restaurants", icon: RestaurantIcon, label: "المطاعم" },
  { href: "/cafes", icon: CafeIcon, label: "المقاهي" },
  { href: "/profile", icon: ArchiveIcon, label: "ملفي" }
];

export function AppNav() {
  const pathname = usePathname();
  const isAuthScreen = pathname === "/login" || pathname === "/register";

  if (isAuthScreen) {
    return null;
  }

  return (
    <nav className="app-nav" aria-label="التنقل الرئيسي">
      <div className="app-nav__brand">
        <Link className="app-nav__brand-link" href="/">
          <TasteMarkIcon className="app-nav__brand-mark" />
          <span>ذوق</span>
        </Link>
        <span className="app-nav__tagline">مكتبة ذوقك الشخصية</span>
      </div>
      <div className="app-nav__links">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className="app-nav__link"
              href={link.href}
              key={link.href}
            >
              <Icon className="app-nav__icon" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/lists") {
    return pathname === "/lists" || pathname.startsWith("/lists/");
  }

  if (href === "/restaurants") {
    return pathname === "/restaurants";
  }

  if (href === "/cafes") {
    return pathname === "/cafes";
  }

  return pathname === href;
}
