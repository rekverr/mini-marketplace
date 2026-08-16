import { api } from "./axios";
import type { LoginResponse, AuthCredentials } from "../features/auth/auth.types";

export const authService = {
  login: async (data: AuthCredentials): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: AuthCredentials): Promise<void> => {
    await api.post("/auth/register", data);
  },
};
