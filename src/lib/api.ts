import type { Participant, Review } from "@/data";

/** In development Vite forwards /api to the server. When deployed, set VITE_API_URL to the server's address. */
const BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Cannot reach the server. Start it with “npm run dev:all” and try again.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    // Vite answers 5xx with an empty body when the API server is not running.
    if (!body?.error && res.status >= 500) throw new Error("Cannot reach the server. Start it with “npm run dev:all” and try again.");
    throw new Error(body?.error ?? `Server error (${res.status}).`);
  }
  return (await res.json()) as T;
}

export type NewParticipant = { name: string; email: string; age: number; consent: true };
export type NewReview = Omit<Review, "id" | "time" | "participant">;

export const loadReviews = () => request<Review[]>("/reviews");
export const loadParticipants = () => request<Participant[]>("/participants");
export const saveParticipant = (p: NewParticipant) =>
  request<Participant>("/participants", { method: "POST", body: JSON.stringify(p) });
export const saveReview = (r: NewReview) => request<Review>("/reviews", { method: "POST", body: JSON.stringify(r) });
export const clearAll = (adminKey: string) =>
  request<{ ok: true }>("/responses", { method: "DELETE", headers: { "x-admin-key": adminKey } });
