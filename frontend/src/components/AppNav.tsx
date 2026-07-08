"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ArchiveIcon, RestaurantIcon, SearchIcon, ShelfIcon, TasteMarkIcon } from "./ui/Icon";

const AUTH_SCREEN_PATHS = new Set(["/login", "/register"]);

const NAV_LINKS = [
  { href: "/lists", icon: ShelfIcon, label: "قوائمي" },
  { href: "/places", icon: RestaurantIcon, label: "الأماكن" },
  { href: "/places?type=restaurant&focus=search", icon: SearchIcon, label: "بحث" },
  { href: "/profile", icon: ArchiveIcon, label: "صفحتي" }
];

export function AppNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSearchFocused = pathname === "/places" && (searchParams.get("focus") === "search" || searchParams.has("q"));

  if (isAuthScreen(pathname)) {
    return null;
  }

  return (
    <nav className="app-nav" aria-label="التنقل الرئيسي">
      <div className="app-nav__brand">
        <Link className="app-nav__brand-link" href="/">
          <TasteMarkIcon className="app-nav__brand-mark" />
          <span>سجل</span>
        </Link>
        <span className="app-nav__tagline">سجل الأماكن</span>
      </div>
      <div className="app-nav__links">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              aria-current={isActive(pathname, link.href, isSearchFocused) ? "page" : undefined}
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

function isAuthScreen(pathname: string): boolean {
  return AUTH_SCREEN_PATHS.has(pathname);
}

function isActive(pathname: string, href: string, isSearchFocused: boolean): boolean {
  if (href === "/lists") {
    return pathname === "/lists" || pathname.startsWith("/lists/");
  }

  if (href.includes("focus=search")) {
    return isSearchFocused;
  }

  if (href === "/places") {
    return !isSearchFocused && (pathname === "/places" || pathname.startsWith("/places/"));
  }

  return pathname === href;
}
