import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AuthCredentials, AuthState, User } from "./auth.types";
import { authService } from "../../api/auth.service";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: false,
  hydrated: false,
};

export const bootstrapSession = createAsyncThunk(
  "auth/bootstrapSession",
  async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    return authService.refresh(refreshToken);
  },
);

export const loginSession = createAsyncThunk(
  "auth/loginSession",
  async (credentials: AuthCredentials) => {
    return authService.login(credentials);
  },
);

export const registerSession = createAsyncThunk(
  "auth/registerSession",
  async (credentials: AuthCredentials) => {
    return authService.register(credentials);
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isHydrating = false;
      state.hydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isHydrating = false;
      state.hydrated = true;
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.isHydrating = true;
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.isHydrating = false;
        state.hydrated = true;

        if (!action.payload) {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
          return;
        }

        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.isHydrating = false;
        state.hydrated = true;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(loginSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.hydrated = true;
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
