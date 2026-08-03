/**
 * Cloudflare Turnstile server-side verification — active only once
 * TURNSTILE_SECRET_KEY is set. Until then, verifyTurnstileToken() always
 * passes (spam protection stays "prepared but disabled" rather than
 * blocking real submissions with no way to prove they're human). The
 * client-side widget (src/components/forms/TurnstileWidget.tsx) mirrors
 * this: it renders nothing at all unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is
 * set, so an unconfigured environment never shows a broken widget.
 */

export type TurnstileVerifyResult = { ok: true } | { ok: false; reason: string };

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstileToken(token: unknown, remoteIp: string): Promise<TurnstileVerifyResult> {
  if (!isTurnstileConfigured()) {
    return { ok: true };
  }
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "missing-token" };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY as string,
        response: token,
        remoteip: remoteIp,
      }),
    });
    const data = (await response.json()) as { success?: boolean };
    return data.success ? { ok: true } : { ok: false, reason: "verification-failed" };
  } catch (error) {
    // Fail OPEN on a network/provider outage — Turnstile being unreachable
    // should never block a real visitor. The honeypot and rate limiter
    // stay active regardless, so this isn't the only line of defense.
    console.error("[turnstile] Verification request failed, allowing submission:", error instanceof Error ? error.message : error);
    return { ok: true };
  }
}
