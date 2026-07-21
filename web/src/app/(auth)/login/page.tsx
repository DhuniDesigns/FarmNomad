import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Secure workspace"
      title="Sign in to FarmNomad"
      description="Access your listings, surplus requests, organisation verification, and commitment orders."
      footer={(
        <>
          New to FarmNomad? <Link className="inline-flex min-h-11 items-center rounded-lg px-1 font-semibold text-primary-700 hover:text-primary-800 focus-visible:ring-3 focus-visible:ring-primary-600/30" href="/register">Create an account</Link>
        </>
      )}
    >
      <Suspense fallback={<p className="mt-6 text-sm font-semibold text-ink-700">Preparing sign in...</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
