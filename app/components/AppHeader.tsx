"use client";

import AuthStatus from "./AuthStatus";
import BackButton from "./BackButton";
import TopTabs from "./TopTabs";
import NotificationBell from "./NotificationBell";

export default function AppHeader() {
  return (
    <header className="relative border-b border-white/[0.08] bg-[#09090d]/80 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="relative flex min-h-20 items-center justify-end px-4">
        <BackButton />
        <a href="/" aria-label="Pull Theory HQ home" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white">
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-full border border-violet-300/30 object-cover shadow-[0_0_24px_rgba(124,58,237,0.38)]" />
          <span className="hidden sm:inline">Pull <span className="text-violet-300">Theory</span></span>
        </a>
        <div className="flex items-center gap-2"><NotificationBell /><AuthStatus /></div>
      </div>
      <TopTabs />
    </header>
  );
}
