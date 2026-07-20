"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/auth/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useDemoStore } from "@/lib/demo/store";
import { routeAfterLogin } from "@/lib/auth/routes";

const roleOptions = ["FARMER", "KITCHEN", "ORGANISATION"] as const;

export function RegisterForm() {
  const router = useRouter();
  const { actions } = useDemoStore();
  const { register, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "FARMER" }
  });

  function onSubmit(values: RegisterValues) {
    actions.registerUser({ name: values.displayName, email: values.email, role: values.role });
    router.push(routeAfterLogin(values.role));
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
        <div className="grid gap-2 md:grid-cols-3">
          {roleOptions.map((role) => (
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold transition-colors duration-150 ease-[var(--ease-farm-out)] hover:border-sage hover:bg-soft" key={role}>
              <input type="radio" value={role} {...register("role")} />
              {role}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit">Create demo account</Button>
    </form>
  );
}
