import { apiClient } from "./client";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from "../types/auth";

export async function Register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/api/auth/register", data);
  return res.data;
}

export async function Login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/api/auth/login", data);
  return res.data;
}
