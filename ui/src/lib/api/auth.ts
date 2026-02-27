import { api } from "./client";

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
}

export interface MeResponse {
  email: string;
  name: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/auth/login", { email, password });
}

export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>("/api/auth/me");
}
