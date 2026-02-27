/**
 * Thin HTTP client pointing at the FlowCD API server.
 * Reads VITE_API_BASE_URL from the Vite env (default: http://localhost:8090).
 * Automatically attaches the Bearer token stored in localStorage when present.
 */
import { getStoredToken } from "@/hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8090";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getStoredToken();
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
  delete(path: string): Promise<void> {
    return request<void>(path, { method: "DELETE" });
  },
};
