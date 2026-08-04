import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store";

// Matches the documented dev host (127.0.0.1:5174 — see README.md/CLAUDE.md),
// not "localhost". Browsers treat 127.0.0.1 and localhost as different sites
// for SameSite cookie purposes, so a mismatch here silently breaks refresh
// cookie delivery. See docs/DECISIONS.md.
export const baseApi = createApi({
  reducerPath: "farmNomadApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:9000",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const accessToken = (getState() as RootState).auth.accessToken;
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Auth", "Listings", "Orders", "Deliveries", "Admin"],
  endpoints: () => ({})
});
