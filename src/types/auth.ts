export type Role = "SELLER" | "BUSINESS" | "ADMIN";

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: Role;
};

export type AuthResponse = {
  id: number;
  username: string;
  email: string;
  role: Role;
  credits: number;
};

export type AuthUser = {
  id: number;
  username: string;
  role: Role;
  credits: number;
};
