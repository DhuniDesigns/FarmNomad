import { baseApi } from "./baseApi";
import type { LoginValues, RegisterValues } from "@/lib/auth/schemas";
import type { SessionUser } from "@/lib/auth/authSlice";

export type AuthResponseBody = {
  accessToken: string | null;
  user: SessionUser | null;
  message: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseBody, LoginValues>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"]
    }),
    register: builder.mutation<AuthResponseBody, RegisterValues>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
      invalidatesTags: ["Auth"]
    }),
    // Reads the httpOnly refresh cookie server-side (credentials: "include"
    // on baseApi) — no body needed. Used for silent session restore
    // (BootstrapAuth) and can also be called to renew an access token.
    refresh: builder.mutation<AuthResponseBody, void>({
      query: () => ({ url: "/api/auth/refresh", method: "POST" })
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"]
    })
  })
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useLogoutMutation } = authApi;
