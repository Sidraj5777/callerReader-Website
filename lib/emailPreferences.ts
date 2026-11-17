// Unsubscribe / resubscribe for recall emails. Public endpoints: the signed
// token from the email link is the proof, no login needed.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface UnsubscribeStatus {
  maskedEmail: string;
  unsubscribed: boolean;
}

type Result<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function call<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/email/${path}`, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: data.message || "Something went wrong. Please try again.",
      };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, message: "Network error. Please try again." };
  }
}

const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const getUnsubscribeStatus = (token: string) =>
  call<UnsubscribeStatus>(`unsubscribe?token=${encodeURIComponent(token)}`);

export const unsubscribe = (token: string) =>
  call<UnsubscribeStatus>("unsubscribe", postJson({ token }));

export const resubscribe = (token: string) =>
  call<UnsubscribeStatus>("resubscribe", postJson({ token }));

export const requestUnsubscribeLink = (email: string) =>
  call<{ message: string }>("unsubscribe-link", postJson({ email }));
