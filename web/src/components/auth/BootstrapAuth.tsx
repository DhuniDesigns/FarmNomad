"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { sessionCleared, sessionEstablished } from "@/lib/auth/authSlice";
import { useRefreshMutation } from "@/lib/api/authApi";

/**
 * Silent session restore (Phase 5.2): on first mount, tries the refresh
 * endpoint once. The access token only ever lives in memory (Redux state),
 * so a hard reload loses it — this is how a real session survives a reload,
 * using the HttpOnly refresh cookie the backend already has.
 *
 * The `useRef` guard is a single-flight guard for this one bootstrap call
 * (also needed because React 18 Strict Mode double-invokes effects in dev).
 * It does not cover the fuller "dedupe concurrent 401-triggered refreshes
 * across in-flight requests" pattern — that's deferred, see docs/DECISIONS.md.
 */
export function BootstrapAuth() {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    refresh()
      .unwrap()
      .then((response) => {
        if (response.accessToken && response.user) {
          dispatch(sessionEstablished({ accessToken: response.accessToken, user: response.user }));
        } else {
          dispatch(sessionCleared());
        }
      })
      .catch(() => {
        dispatch(sessionCleared());
      });
  }, [dispatch, refresh]);

  return null;
}
