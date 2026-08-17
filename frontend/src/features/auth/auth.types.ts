export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  hydrated: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export type AuthSessionResponse = LoginResponse;
