"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(pathname.startsWith("/login/app") || pathname.startsWith("/binders") ? "/marketplace/browse" : "/");
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
    >
      ← Back
    </button>
  );
}
