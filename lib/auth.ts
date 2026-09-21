const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN_KEY = "rr_token";

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export interface AuthResponse {
  token: string;
  username: string; // currently the user's email, per AuthController
  role: string;
}

type AuthResult =
  | { ok: true; data: AuthResponse }
  | { ok: false; status: number; message: string };

async function postAuth(path: string, body: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: data.message || "Something went wrong. Please try again.",
      };
    }

    return { ok: true, data: data as AuthResponse };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, message: "Network error. Please try again." };
  }
}

export const registerUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => postAuth("register", data);

export const loginUser = (data: { email: string; password: string }) =>
  postAuth("login", data);

type SimpleResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

// NOTE: endpoint paths assumed to follow the same /api/auth/* convention as
// register/login above (see AuthController). Confirm against the actual
// backend and adjust the two paths below ("forgot-password" /
// "reset-password") if they differ.
export async function requestPasswordReset(email: string): Promise<SimpleResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: data.message || "Something went wrong. Please try again.",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, message: "Network error. Please try again." };
  }
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<SimpleResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: resData.message || "This reset link is invalid or has expired.",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, message: "Network error. Please try again." };
  }
}

async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export interface FetchedProfile {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  age?: number | null;
  city?: string;
  stateCode?: string;
  zipCode?: string;
  lifestyleNotes?: string | null;
  hasChildren?: boolean;
  categories?: string[];
  brands?: string[];
  allergies?: string[];
  pets?: string[];
  healthConditions?: string[];
  children?: { age: number; allergies: string | null }[];
  vehicles?: { make: string; model: string; year: number | null }[];
  sportsActivities?: string[];
}

// Returns null if there's no logged-in user, or the fetch fails — callers
// treat that the same as "nothing to prefill" rather than an error.
export async function getMyProfile(): Promise<FetchedProfile | null> {
  if (!getToken()) return null;
  try {
    const res = await authFetch("/api/profile/me");
    if (!res.ok) return null;
    return (await res.json()) as FetchedProfile;
  } catch (err) {
    console.error(err);
    return null;
  }
}

type UpdateResult =
  | { ok: true; data: FetchedProfile }
  | { ok: false; status: number; message: string };

// Payload shape matches UserImportDTO on the backend — see /form/page.tsx's
// buildProfilePayload() for how it's assembled from the form state.
export async function updateMyProfile(payload: Record<string, unknown>): Promise<UpdateResult> {
  try {
    const res = await authFetch("/api/profile/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, message: data.message || "Could not save your profile." };
    }
    return { ok: true, data: data as FetchedProfile };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, message: "Network error. Please try again." };
  }
}
