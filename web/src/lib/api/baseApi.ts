import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "farmNomadApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000",
    credentials: "include"
  }),
  tagTypes: ["Auth", "Listings", "Orders", "Deliveries", "Admin"],
  endpoints: () => ({})
});
