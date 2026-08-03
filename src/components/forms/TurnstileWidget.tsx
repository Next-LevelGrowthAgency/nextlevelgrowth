"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Failed to load Turnstile script")));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * Renders Cloudflare Turnstile only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is
 * set — otherwise renders nothing, so a form with this widget still works
 * end to end (server-side verifyTurnstileToken() also no-ops without
 * TURNSTILE_SECRET_KEY). Failing to load the script never blocks
 * submission; it just means the token stays null, and the server-side
 * check treats an unconfigured Turnstile the same way either way.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onToken(token),
          "error-callback": () => onToken(null),
          "expired-callback": () => onToken(null),
        });
      })
      .catch(() => {
        // Script failed to load — the widget just never renders; the form
        // remains submittable and the server-side check governs.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onToken is expected to be stable per mount
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} id={`turnstile-widget-${id}`} className="mt-1" />;
}
