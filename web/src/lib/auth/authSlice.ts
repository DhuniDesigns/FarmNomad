import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserRole } from "@/types/auth";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

type AuthState = {
  accessToken: string | null;
  user: SessionUser | null;
  /** True once the initial silent-restore attempt (see BootstrapAuth) has finished, success or not. */
  bootstrapped: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  bootstrapped: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionEstablished(state, action: PayloadAction<{ accessToken: string; user: SessionUser }>) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.bootstrapped = true;
    },
    sessionCleared(state) {
      state.accessToken = null;
      state.user = null;
      state.bootstrapped = true;
    }
  }
});

export const { sessionEstablished, sessionCleared } = authSlice.actions;
export default authSlice.reducer;
