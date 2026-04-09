export function saveToken(token: string): void {
  localStorage.setItem("aj_admin_token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("aj_admin_token");
}

export function clearToken(): void {
  localStorage.removeItem("aj_admin_token");
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
