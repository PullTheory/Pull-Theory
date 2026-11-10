"use client";

import AuthStatus from "./AuthStatus";
import BackButton from "./BackButton";
import TopTabs from "./TopTabs";
import NotificationBell from "./NotificationBell";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e0d7] bg-white/95 shadow-[0_5px_25px_rgba(20,20,20,.06)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton />
          <a href="/" aria-label="PullTheoryTrade home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg border border-[#e8e0d6] object-cover sm:h-10 sm:w-10" />
            <span className="hidden text-sm font-black uppercase tracking-[.13em] text-[#20222b] sm:inline">Pull<span className="text-[#c96c42]">Theory</span></span>
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
