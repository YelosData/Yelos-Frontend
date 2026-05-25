import type { AuthResponse, AuthUser } from "../../types/auth";

const USER_KEY = "user";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function saveAuth(auth: AuthResponse): AuthUser {
  const user: AuthUser = {
    id: auth.id,
    username: auth.username,
    email: auth.email,
    role: auth.role,
    credits: auth.credits,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);

  return user;
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuth();
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearAuth(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function updateStoredUserCredits(credits: number): AuthUser | null {
  const currentUser = getAuthUser();

  if (!currentUser) {
    return null;
  }

  const updatedUser: AuthUser = {
    ...currentUser,
    credits,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

  return updatedUser;
}
