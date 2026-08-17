import { publicApi } from "./axios";
import type {
  AuthCredentials,
  AuthSessionResponse,
  LoginResponse,
} from "../features/auth/auth.types";

export const authService = {
  login: async (data: AuthCredentials): Promise<LoginResponse> => {
    const response = await publicApi.post("/auth/login", data);
    return response.data;
  },

  register: async (data: AuthCredentials): Promise<void> => {
    await publicApi.post("/auth/register", data);
  },

  refresh: async (refreshToken: string): Promise<AuthSessionResponse> => {
    const response = await publicApi.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await publicApi.post("/auth/logout", { refreshToken });
  },
};
