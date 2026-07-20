"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useDemoStore } from "@/lib/demo/store";

export function SettingsPanel() {
  const { currentUser, actions } = useDemoStore();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [location, setLocation] = useState(currentUser.location);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Account</p>
      <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">Profile settings</h1>
      <section className="mt-6 grid gap-4 rounded-2xl border border-border bg-white p-6 shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <TextField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
        <div>
          <Button type="button" onClick={() => actions.updateProfile({ name, email, phone, location })}>Save profile</Button>
        </div>
      </section>
    </main>
  );
}
