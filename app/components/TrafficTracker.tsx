"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const storageKey = "pull-theory-visitor-id";

function getVisitorId() {
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

// Funnel events use the same anonymous visitor ID as page activity. No names,
// emails, or form values are ever sent to the activity log.
export function recordTrafficEvent(event: string) {
  const visitorId = getVisitorId();
  return fetch("/api/traffic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, path: `/__funnel/${event}` }),
    keepalive: true,
  });
}

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = getVisitorId();
    void fetch("/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: pathname }),
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
