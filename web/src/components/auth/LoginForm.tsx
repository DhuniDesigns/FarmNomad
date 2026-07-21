"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { SelectField, TextField } from "@/components/ui/Field";
import { useDemoStore } from "@/lib/demo/store";
import type { UserRole } from "@/types/auth";
import { routeAfterLogin } from "@/lib/auth/routes";
import { triggerHaptic } from "@/lib/interactions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { actions } = useDemoStore();
  const [role, setRole] = useState<UserRole>("FARMER");
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  function onSubmit(values: LoginValues) {
    void values;
    triggerHaptic("success");
    actions.loginAs(role);
    router.push(searchParams.get("returnTo") ?? routeAfterLogin(role));
  }

  function continueWithGoogle() {
    actions.loginAs(role);
    router.push(searchParams.get("returnTo") ?? routeAfterLogin(role));
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Email" id="email" type="email" autoComplete="email" error={formState.errors.email?.message} spellCheck={false} {...register("email")} />
      <TextField label="Password" id="password" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register("password")} />
      <SelectField label="Account role" id="account-role" value={role} onChange={(event) => {
        triggerHaptic("selection");
        setRole(event.target.value as UserRole);
      }}>
        <option value="FARMER">Farmer</option>
        <option value="KITCHEN">Kitchen</option>
        <option value="ORGANISATION">Organisation</option>
        <option value="ADMIN">Admin</option>
      </SelectField>
      <Button type="submit">Sign in</Button>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-semibold text-ink-500">
        <span className="h-px bg-border" />
        <span>or continue with</span>
        <span className="h-px bg-border" />
      </div>
      <GoogleAuthButton label="Sign in with Google" onClick={continueWithGoogle} />
    </form>
  );
}
