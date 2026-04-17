export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    const message =
      isRecord(data) && typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

async function apiRequestJson<T>(args: {
  method: HttpMethod;
  path: string;
  body?: unknown;
  token?: string;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (args.token) headers.Authorization = `Bearer ${args.token}`;

  const res = await fetch(`${API_BASE_URL}${args.path}`, {
    method: args.method,
    headers,
    body: args.body === undefined ? undefined : JSON.stringify(args.body),
  });

  const data = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    const message =
      isRecord(data) && typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function apiPostAuthJson<T>(path: string, body: unknown, token: string): Promise<T> {
  return apiRequestJson<T>({ method: "POST", path, body, token });
}

export async function apiGetAuthJson<T>(path: string, token: string): Promise<T> {
  return apiRequestJson<T>({ method: "GET", path, token });
}

export async function apiPatchAuthJson<T>(path: string, body: unknown, token: string): Promise<T> {
  return apiRequestJson<T>({ method: "PATCH", path, body, token });
}

export async function apiDeleteAuthJson<T>(path: string, token: string): Promise<T> {
  return apiRequestJson<T>({ method: "DELETE", path, token });
}
