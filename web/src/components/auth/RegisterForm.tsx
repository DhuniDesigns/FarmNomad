"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/auth/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { TextField } from "@/components/ui/Field";
import { useDemoStore } from "@/lib/demo/store";
import { routeAfterLogin } from "@/lib/auth/routes";
import { triggerHaptic } from "@/lib/interactions";

const roleOptions = [
  { value: "FARMER", label: "Farmer", description: "List harvests and surplus." },
  { value: "KITCHEN", label: "Kitchen", description: "Move prepared stock." },
  { value: "ORGANISATION", label: "Organisation", description: "Claim verified surplus." }
] as const;

export function RegisterForm() {
  const router = useRouter();
  const { actions } = useDemoStore();
  const { register, handleSubmit, formState, watch } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "FARMER" }
  });
  const selectedRole = watch("role");

  function onSubmit(values: RegisterValues) {
    triggerHaptic("success");
    actions.registerUser({ name: values.displayName, email: values.email, role: values.role });
    router.push(routeAfterLogin(values.role));
  }

  function continueWithGoogle() {
    actions.registerUser({
      name: "FarmNomad member",
      email: `member-${Date.now()}@farmnomad.co.uk`,
      role: selectedRole
    });
    router.push(routeAfterLogin(selectedRole));
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Display name" id="displayName" autoComplete="name" error={formState.errors.displayName?.message} {...register("displayName")} />
        <TextField label="Email" id="email" type="email" autoComplete="email" error={formState.errors.email?.message} spellCheck={false} {...register("email")} />
      </div>
      <TextField label="Password" id="password" type="password" autoComplete="new-password" error={formState.errors.password?.message} {...register("password")} />
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-ink-900">Account type</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {roleOptions.map((role) => (
            <label className="grid min-h-[92px] gap-2 rounded-xl border border-brand-border px-3 py-3 text-sm font-semibold transition-[background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-farm-out)] hover:-translate-y-0.5 hover:border-primary-600 hover:bg-primary-50 focus-within:ring-3 focus-within:ring-primary-600/30" key={role.value}>
              <span className="flex items-center gap-2 text-ink-950">
                <input type="radio" value={role.value} {...register("role")} onClick={() => triggerHaptic("selection")} />
                {role.label}
              </span>
              <span className="text-xs font-medium leading-5 text-ink-500">{role.description}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit">Create account</Button>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-semibold text-ink-500">
        <span className="h-px bg-border" />
        <span>or continue with</span>
        <span className="h-px bg-border" />
      </div>
      <GoogleAuthButton label="Sign up with Google" onClick={continueWithGoogle} />
    </form>
  );
}
