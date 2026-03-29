import { useSyncExternalStore } from "react";

const KEY = "admin";

function subscribe(cb: () => void) {
  globalThis.addEventListener("storage", cb);

  return () => {
    globalThis.removeEventListener("storage", cb);
  };
}

function getSnapshot(): boolean {
  return localStorage.getItem(KEY) === "true";
}

/** Reads `?admin=true` from URL once and persists to localStorage. */
export function initAdmin(): void {
  const params = new URLSearchParams(location.search);

  if (params.get(KEY) === "true") {
    localStorage.setItem(KEY, "true");
    params.delete(KEY);
    const qs = params.toString();
    history.replaceState({}, "", location.pathname + (qs ? `?${qs}` : ""));
  }
}

export function useAdmin(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function logoutAdmin(): void {
  localStorage.removeItem(KEY);
  globalThis.dispatchEvent(new Event("storage"));
}
