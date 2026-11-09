"use client";

import AuthStatus from "./AuthStatus";
import BackButton from "./BackButton";
import TopTabs from "./TopTabs";
import NotificationBell from "./NotificationBell";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080f1c]/95 shadow-[0_8px_30px_rgba(0,0,0,.24)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton />
          <a href="/" aria-label="PullTheoryTrade home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-xl border border-sky-200/20 object-cover shadow-[0_0_20px_rgba(56,189,248,.15)] sm:h-10 sm:w-10" />
            <span className="hidden text-sm font-black uppercase tracking-[.13em] text-white sm:inline">Pull<span className="text-sky-300">Theory</span></span>
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <AuthStatus />
        </div>
      </div>
      <TopTabs />
    </header>
  );
}
