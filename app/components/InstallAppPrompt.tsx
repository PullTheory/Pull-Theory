"use client";

import { useEffect, useState } from "react";

export default function InstallAppPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    setShow(isIos && !isStandalone && !sessionStorage.getItem("pull-theory-install-dismissed"));
  }, []);

  if (!show) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-md rounded-2xl border border-violet-300/35 bg-[#121013]/95 p-4 text-sm text-zinc-200 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <img src="/icons/apple-touch-icon.png" alt="Pull Theory" className="h-11 w-11 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">Add Pull Theory to your iPhone</p>
          <p className="mt-1 leading-5 text-zinc-300">Tap Share, then choose <span className="font-semibold text-white">Add to Home Screen</span> for the full-screen app.</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss install instructions"
          onClick={() => {
            sessionStorage.setItem("pull-theory-install-dismissed", "true");
            setShow(false);
          }}
          className="rounded-lg px-2 py-1 text-lg leading-none text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
