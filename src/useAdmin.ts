import { useSyncExternalStore } from "react";

const KEY = "admin";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getSnapshot() {
  return localStorage.getItem(KEY) === "true";
}

/** Reads `?admin=true` from URL once and persists to localStorage. */
export function initAdmin() {
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
