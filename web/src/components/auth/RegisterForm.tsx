"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/auth/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useAppDispatch } from "@/lib/hooks";
import { sessionEstablished } from "@/lib/auth/authSlice";
import { useRegisterMutation } from "@/lib/api/authApi";
import { extractApiErrorMessage } from "@/lib/api/errorMessage";
import { routeAfterLogin } from "@/lib/auth/routes";
import { triggerHaptic } from "@/lib/interactions";

const roleOptions = [
  { value: "FARMER", label: "Farmer", description: "List harvests and surplus." },
  { value: "KITCHEN", label: "Kitchen", description: "Move prepared stock." },
  { value: "ORGANISATION", label: "Organisation", description: "Claim verified surplus." }
] as const;

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerAccount, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "FARMER" }
  });

  async function onSubmit(values: RegisterValues) {
    setFormError("");
    try {
      const response = await registerAccount(values).unwrap();
      if (!response.accessToken || !response.user) {
        setFormError(response.message || "Couldn't create that account.");
        return;
      }
      triggerHaptic("success");
      dispatch(sessionEstablished({ accessToken: response.accessToken, user: response.user }));
      router.push(routeAfterLogin(response.user.role));
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Couldn't create that account."));
    }
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
      {formError ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger-600" role="alert">
          {formError}
        </p>
      ) : null}
      <Button disabled={isLoading} type="submit">
        {isLoading ? "Creating account…" : "Create account"}
      </Button>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-semibold text-ink-500">
        <span className="h-px bg-border" />
        <span>or continue with</span>
        <span className="h-px bg-border" />
      </div>
      <p className="rounded-full border border-dashed border-border bg-soft px-4 py-3 text-center text-sm font-semibold text-ink-500">
        Google sign-up isn&apos;t connected yet
      </p>
    </form>
  );
}
