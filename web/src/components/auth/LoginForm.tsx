"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useAppDispatch } from "@/lib/hooks";
import { sessionEstablished } from "@/lib/auth/authSlice";
import { useLoginMutation } from "@/lib/api/authApi";
import { extractApiErrorMessage } from "@/lib/api/errorMessage";
import { routeAfterLogin } from "@/lib/auth/routes";
import { triggerHaptic } from "@/lib/interactions";

// No role selector here — with a real backend, role comes from the account
// itself (whatever was chosen at registration), not something picked at
// login. The old demo version let you pick "log in as" any role; that only
// made sense against the fake in-memory store.
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginValues) {
    setFormError("");
    try {
      const response = await login(values).unwrap();
      if (!response.accessToken || !response.user) {
        setFormError(response.message || "Invalid email or password.");
        return;
      }
      triggerHaptic("success");
      dispatch(sessionEstablished({ accessToken: response.accessToken, user: response.user }));
      router.push(searchParams.get("returnTo") ?? routeAfterLogin(response.user.role));
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Invalid email or password."));
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Email" id="email" type="email" autoComplete="email" error={formState.errors.email?.message} spellCheck={false} {...register("email")} />
      <TextField label="Password" id="password" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register("password")} />
      {formError ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger-600" role="alert">
          {formError}
        </p>
      ) : null}
      <Button disabled={isLoading} type="submit">
        {isLoading ? "Signing in…" : "Sign in"}
      </Button>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-semibold text-ink-500">
        <span className="h-px bg-border" />
        <span>or continue with</span>
        <span className="h-px bg-border" />
      </div>
      <p className="rounded-full border border-dashed border-border bg-soft px-4 py-3 text-center text-sm font-semibold text-ink-500">
        Google sign-in isn&apos;t connected yet
      </p>
    </form>
  );
}
