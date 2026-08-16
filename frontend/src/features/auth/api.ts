import { api } from "../../api/axios";
import { type LoginResponse } from "./auth.types";

export const loginUser = async (
  data: Record<string, string>,
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data: Record<string, string>) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};
