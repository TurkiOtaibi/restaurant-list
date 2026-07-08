"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { getAccessToken } from "@/lib/api";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "restaurantWishlist.installPromptDismissed";
const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const AUTH_ROUTE_PREFIXES = ["/login", "/register", "/auth", "/password", "/forgot-password", "/reset-password"];
const APP_ROUTE_PREFIXES = ["/places", "/lists", "/profile", "/restaurants", "/cafes"];

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const userAgent = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  const isWebKit = /WebKit/.test(userAgent);
  const isCriOs = /CriOS|FxiOS|EdgiOS/.test(userAgent);
  return isIos && isWebKit && !isCriOs;
}

function canShowInstallPrompt(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  if (AUTH_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  return APP_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasAuthenticatedSession() {
  return Boolean(getAccessToken());
}

function hasActiveDismissal() {
  const dismissedAtValue = window.localStorage.getItem(DISMISS_KEY);
  if (!dismissedAtValue) {
    return false;
  }

  const dismissedAt = Number(dismissedAtValue);
  if (!Number.isFinite(dismissedAt)) {
    window.localStorage.removeItem(DISMISS_KEY);
    return false;
  }

  if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
    return true;
  }

  window.localStorage.removeItem(DISMISS_KEY);
  return false;
}

export function InstallAppPrompt() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setShowIosHint(false);

    if (hasActiveDismissal() || isStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (hasActiveDismissal() || isStandalone()) {
        return;
      }
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowIosHint(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const hintTimer = window.setTimeout(() => {
      if (canShowInstallPrompt(pathname) && isIosSafari() && !isStandalone() && hasAuthenticatedSession()) {
        setShowIosHint(true);
      }
    }, 1800);

    return () => {
      window.clearTimeout(hintTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [pathname]);

  async function install() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    dismiss();
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setInstallPrompt(null);
    setShowIosHint(false);
  }

  if (!installPrompt && !showIosHint) {
    return null;
  }

  if (!canShowInstallPrompt(pathname) || !hasAuthenticatedSession()) {
    return null;
  }

  return (
    <aside aria-labelledby="install-app-prompt-title" className="install-app-prompt">
      <div>
        <h2 id="install-app-prompt-title">ثبّت سجل</h2>
        <p>{installPrompt ? "افتح التطبيق بسرعة من الشاشة الرئيسية." : "من زر المشاركة اختر إضافة إلى الشاشة الرئيسية."}</p>
      </div>
      <div className="install-app-prompt__actions">
        {installPrompt ? (
          <Button onClick={() => void install()} type="button">
            تثبيت
          </Button>
        ) : null}
        <Button onClick={dismiss} type="button" variant="secondary">
          لاحقاً
        </Button>
      </div>
    </aside>
  );
}
