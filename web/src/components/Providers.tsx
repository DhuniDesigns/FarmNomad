"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";
import { BootstrapAuth } from "@/components/auth/BootstrapAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState (not a module-level constant) so each client gets its own store
  // instance rather than sharing one across requests/users.
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <BootstrapAuth />
      {children}
    </Provider>
  );
}
