import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join the supply network"
      title="Create your FarmNomad account"
      description="Set up a farmer, kitchen, or organisation workspace and start coordinating local supply."
      footer={(
        <>
          Already have an account? <Link className="inline-flex min-h-11 items-center rounded-lg px-1 font-semibold text-primary-700 hover:text-primary-800 focus-visible:ring-3 focus-visible:ring-primary-600/30" href="/login">Sign in</Link>
        </>
      )}
    >
      <RegisterForm />
    </AuthShell>
  );
}
