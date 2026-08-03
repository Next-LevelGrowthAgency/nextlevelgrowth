import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Section tone="paper" className="min-h-[70vh] flex items-center">
      <Container className="mx-auto max-w-md">
        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-soft">
          <h1 className="font-display text-display-sm text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-600">{description}</p>

          <div className="mt-6">
            {isSupabaseAuthConfigured() ? (
              children
            ) : (
              <div className="rounded-xl border border-dashed border-ink-300 bg-paper-200 p-5 text-sm text-ink-600">
                <p className="font-medium text-ink-800">Accounts aren&rsquo;t set up yet.</p>
                <p className="mt-1.5">
                  This site&rsquo;s login system isn&rsquo;t configured in this environment yet. If you need help now,{" "}
                  <a href={`mailto:${siteConfig.contact.email}`} className="underline hover:text-ink-900">
                    email us
                  </a>{" "}
                  directly.
                </p>
              </div>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-500">
          <Link href="/" className="underline hover:text-ink-800">
            Back to nextlevelgrowthagency.com
          </Link>
        </p>
      </Container>
    </Section>
  );
}
