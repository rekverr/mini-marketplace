export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
