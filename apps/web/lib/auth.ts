export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

export type AuthResponse = {
  ok: boolean;
  token: string;
  user: AuthUser;
};

const TOKEN_KEY = "bts_token";
const USER_KEY = "bts_user";

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
