import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell title="Create Your Account" description="Set up client portal access to track your requests with Next Level Growth.">
      <SignupForm />
    </AuthShell>
  );
}
