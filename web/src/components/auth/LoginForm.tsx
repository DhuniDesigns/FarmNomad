"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { useDemoStore } from "@/lib/demo/store";
import type { UserRole } from "@/types/auth";
import { routeAfterLogin } from "@/lib/auth/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { actions } = useDemoStore();
  const [role, setRole] = useState<UserRole>("FARMER");
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "farmer@farmnomad.test",
      password: "demopassword"
    }
  });

  function onSubmit(values: LoginValues) {
    void values;
    actions.loginAs(role);
    router.push(searchParams.get("returnTo") ?? routeAfterLogin(role));
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Email" id="email" type="email" autoComplete="email" error={formState.errors.email?.message} spellCheck={false} {...register("email")} />
      <TextField label="Password" id="password" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register("password")} />
      <SelectField label="Demo role" id="demo-role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
        <option value="FARMER">Farmer</option>
        <option value="KITCHEN">Kitchen</option>
        <option value="ORGANISATION">Organisation</option>
        <option value="ADMIN">Admin</option>
      </SelectField>
      <Button type="submit">Sign in to demo</Button>
      <p className="rounded-xl bg-soft p-3 text-sm font-semibold text-ink-700">
        Demo auth stores only a local role and user id. It does not store JWTs in localStorage.
      </p>
    </form>
  );
}
