import {
  checkAiUsageMigrationStatus,
  checkAuthMigrationStatus,
  checkClientAccessMigrationStatus,
  checkConsentAuditMigrationStatus,
  checkDatabaseConnection,
  getEnvironmentStatus,
} from "@/lib/env-status";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Diagnostics — Admin", robots: { index: false, follow: false } };

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-50 py-3 last:border-0">
      <div>
        <p className="font-medium text-ink-900">{label}</p>
        {detail ? <p className="mt-0.5 text-xs text-ink-500">{detail}</p> : null}
      </div>
      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-grove-100 text-grove-800" : "bg-ember-100 text-ember-800"}`}>
        {ok ? "Configured" : "Not configured"}
      </span>
    </div>
  );
}

export default async function AdminDiagnosticsPage() {
  const status = getEnvironmentStatus();
  const [dbConnection, authMigration, aiUsageMigration, consentAuditMigration, clientAccessMigration] = await Promise.all([
    checkDatabaseConnection(),
    checkAuthMigrationStatus(),
    checkAiUsageMigrationStatus(),
    checkConsentAuditMigrationStatus(),
    checkClientAccessMigrationStatus(),
  ]);

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Diagnostics</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">
        Configuration status only — never shows a secret value, just whether each integration is set up and reachable.
      </p>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-ink-900">Core</h2>
        <div className="mt-2">
          <StatusRow label="Site URL (NEXT_PUBLIC_SITE_URL)" ok={status.siteUrlConfigured} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-ink-900">Email (Resend)</h2>
        <div className="mt-2">
          <StatusRow label="Resend API key + sender address" ok={status.resendConfigured} />
          <StatusRow label="EMAIL_FROM_ADDRESS set" ok={status.senderAddressConfigured} />
          <StatusRow
            label="Sender domain verified in Resend"
            ok={status.resendConfigured}
            detail="This app can't check domain verification directly — confirm it under Resend → Domains. An unverified domain will silently fail or land in spam even though the keys are set."
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-ink-900">Database (Supabase)</h2>
        <div className="mt-2">
          <StatusRow label="Supabase URL + service role key" ok={status.databaseConfigured} />
          <StatusRow label="Connection" ok={dbConnection.ok} detail={dbConnection.detail} />
          <StatusRow label="Migration 0004 applied (AI usage/budget tables)" ok={aiUsageMigration.ok} detail={aiUsageMigration.detail} />
          <StatusRow label="Migration 0005 applied (consent audit-trail columns)" ok={consentAuditMigration.ok} detail={consentAuditMigration.detail} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-ink-900">Authentication (Supabase Auth)</h2>
        <div className="mt-2">
          <StatusRow label="Supabase Auth (URL + anon key)" ok={status.authConfigured} />
          <StatusRow label="Migration 0003 applied (profiles table reachable)" ok={authMigration.ok} detail={authMigration.detail} />
          <StatusRow label="Migration 0007 applied (client-access request columns)" ok={clientAccessMigration.ok} detail={clientAccessMigration.detail} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-ink-900">Spam protection &amp; optional integrations</h2>
        <div className="mt-2">
          <StatusRow label="Cloudflare Turnstile" ok={status.turnstileConfigured} detail="Honeypot + rate limiting stay active either way." />
          <StatusRow
            label="Growth Coach AI (Anthropic Claude)"
            ok={status.growthCoachAiConfigured}
            detail="Open-ended replies fall back to the scripted engine until ANTHROPIC_API_KEY is set and NEXT_PUBLIC_CHAT_ENABLED is true."
          />
        </div>
      </div>
    </div>
  );
}
