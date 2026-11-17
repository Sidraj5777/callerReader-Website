"use client";

import { useEffect, useRef, useState } from "react";
import { loginWithGoogle, saveToken } from "@/lib/auth";

/*
 * "Continue with Google" using Google Identity Services.
 * Renders nothing unless NEXT_PUBLIC_GOOGLE_CLIENT_ID is set, so it's safe to
 * deploy before the backend endpoint is ready.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = { credential: string };

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (res: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("Could not load Google sign-in."));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface GoogleSignInResult {
  email: string;
  firstName: string;
  lastName: string;
  newUser: boolean;
}

export default function GoogleSignInButton({
  text = "continue_with",
  onSuccess,
}: {
  text?: "signin_with" | "signup_with" | "continue_with";
  onSuccess: (result: GoogleSignInResult) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    const handleCredential = async (res: GoogleCredentialResponse) => {
      setError("");
      setLoading(true);
      const result = await loginWithGoogle(res.credential);
      setLoading(false);
      if (!result.ok) {
        setError(result.status === 401 ? "Google sign-in could not be verified. Please try again." : result.message);
        return;
      }
      saveToken(result.data.token);
      onSuccessRef.current({
        email: result.data.email || result.data.username,
        firstName: result.data.firstName || "",
        lastName: result.data.lastName || "",
        newUser: !!result.data.newUser,
      });
    };

    loadGoogleScript()
      .then(() => {
        const el = containerRef.current;
        if (cancelled || !el || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          ux_mode: "popup",
          cancel_on_tap_outside: true,
        });
        el.innerHTML = "";
        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width: Math.min(400, Math.max(200, Math.floor(el.offsetWidth))),
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!CLIENT_ID) return null;

  return (
    <div>
      <div className="flex items-center gap-3 my-5 text-sm text-gray-500" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div ref={containerRef} className="flex justify-center min-h-[44px] w-full" />
      {loading && <p className="mt-3 text-sm text-center text-blue-700">Signing you in…</p>}
      {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
