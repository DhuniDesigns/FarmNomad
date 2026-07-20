import { baseApi } from "./baseApi";
import type { LoginValues, RegisterValues } from "@/lib/auth/schemas";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string | null; message: string }, LoginValues>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"]
    }),
    register: builder.mutation<{ accessToken: string | null; message: string }, RegisterValues>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
      invalidatesTags: ["Auth"]
    })
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
