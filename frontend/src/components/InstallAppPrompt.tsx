"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "restaurantWishlist.installPromptDismissed";

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

export function InstallAppPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem(DISMISS_KEY) === "true" || isStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowIosHint(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const hintTimer = window.setTimeout(() => {
      if (isIosSafari() && !isStandalone()) {
        setShowIosHint(true);
      }
    }, 1800);

    return () => {
      window.clearTimeout(hintTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

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
    window.localStorage.setItem(DISMISS_KEY, "true");
    setInstallPrompt(null);
    setShowIosHint(false);
  }

  if (!installPrompt && !showIosHint) {
    return null;
  }

  return (
    <aside className="install-app-prompt" role="status">
      <div>
        <strong>ثبّت سجل</strong>
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
