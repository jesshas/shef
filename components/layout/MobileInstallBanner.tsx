"use client";

import { useEffect, useState } from "react";
import { X, Share, MoreVertical } from "lucide-react";

const DISMISSED_KEY = "mealmuse_install_banner_dismissed";

type Platform = "ios" | "android" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;

  // Already installed as standalone — don't show
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  ) {
    return null;
  }

  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return null;
}

export function MobileInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const p = detectPlatform();
    if (p) {
      setPlatform(p);
      // Small delay so it doesn't pop up instantly on load
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  if (!visible || !platform) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80 animate-slide-up">
      <div className="bg-cream border border-rose/40 rounded-2xl shadow-lg p-4 flex gap-3 items-start">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-espresso rounded-xl flex items-center justify-center text-lg">
          🌿
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm text-espresso">
            Add to your home screen
          </p>
          {platform === "ios" ? (
            <p className="text-xs text-espresso/60 font-sans mt-0.5 leading-relaxed">
              Tap{" "}
              <span className="inline-flex items-center gap-0.5 align-middle">
                <Share size={11} className="text-espresso/50" />
              </span>{" "}
              <strong className="font-medium">Share</strong> then{" "}
              <strong className="font-medium">&ldquo;Add to Home Screen&rdquo;</strong> for the full app experience.
            </p>
          ) : (
            <p className="text-xs text-espresso/60 font-sans mt-0.5 leading-relaxed">
              Tap{" "}
              <span className="inline-flex items-center gap-0.5 align-middle">
                <MoreVertical size={11} className="text-espresso/50" />
              </span>{" "}
              <strong className="font-medium">Menu</strong> then{" "}
              <strong className="font-medium">&ldquo;Add to Home Screen&rdquo;</strong> for quick access.
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1 rounded-lg text-espresso/30 hover:text-espresso hover:bg-linen transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
