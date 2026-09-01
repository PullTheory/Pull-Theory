"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";
import { recordTrafficEvent } from "../components/TrafficTracker";

const plans = [
  { id: "collector", name: "Collector", price: "Free", detail: "0 included PullShield trades" },
  { id: "trader", name: "Trader", price: "$14.99/mo", detail: "2 included PullShield trades" },
  { id: "pro", name: "Pro", price: "$24.99/mo", detail: "5 included PullShield trades" },
  { id: "elite", name: "Elite", price: "$39.99/mo", detail: "10 included PullShield trades" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("collector");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [returnTo, setReturnTo] = useState("/marketplace/browse");

  useEffect(() => {
    const requestedPlan = new URLSearchParams(window.location.search).get("plan");
    const requestedReturn = new URLSearchParams(window.location.search).get("returnTo");
    const safeReturn = requestedReturn?.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "/marketplace/browse";
    setReturnTo(safeReturn);
    if (plans.some((option) => option.id === requestedPlan)) {
      setPlan(requestedPlan as (typeof plans)[number]["id"]);
    }
    async function redirectSignedInCollector() {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (data.session?.user) {
        router.replace(safeReturn);
        return;
      }
      setCheckingAccount(false);
      void recordTrafficEvent("signup_opened");
    }
    redirectSignedInCollector();
  }, [router]);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setConfirmationEmail(null);

    if (!termsAccepted) {
      setMessage("You must accept the Pull Theory Terms and PullShield Rules before creating an account.");
      setLoading(false);
      return;
    }

    const normalizedUsername = username.trim();
    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(normalizedUsername)) {
      setMessage("Choose a username with 3–24 letters, numbers, hyphens, or underscores.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase client not available.");
      setLoading(false);
      return;
    }

    void recordTrafficEvent("signup_submitted");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: normalizedUsername, membership_plan: plan, terms_accepted: true, terms_accepted_at: new Date().toISOString(), terms_version: "2026-08-30" } },
    });

    if (error) {
      setMessage(error.message);
    } else if (data?.session?.user) {
      router.replace(returnTo);
    } else if (data?.user) {
      setConfirmationEmail(email.trim());
      void recordTrafficEvent("confirmation_sent");
    } else {
      setConfirmationEmail(email.trim());
      void recordTrafficEvent("confirmation_sent");
    }

    setLoading(false);
  }

  if (checkingAccount) return <main className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-violet-500/30 bg-white/5 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur">
        <a
          href="/"
          className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300"
        >
          Pull Theory HQ
        </a>

        <h1 className="mt-8 text-3xl font-semibold">Create your account.</h1>
        <p className="mt-2 text-zinc-400">Choose your membership, then start tracking and trading with confidence.</p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <fieldset>
            <legend className="mb-3 block text-sm text-zinc-300">Choose your membership</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {plans.map((option) => <label key={option.id} className={`cursor-pointer rounded-2xl border p-3 transition ${plan === option.id ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-black/25 hover:border-white/25"}`}>
                <input type="radio" name="plan" value={option.id} checked={plan === option.id} onChange={() => setPlan(option.id)} className="sr-only" />
                <span className="block text-sm font-semibold text-white">{option.name} <span className="text-violet-200">{option.price}</span></span>
                <span className="mt-1 block text-xs text-zinc-400">{option.detail}</span>
              </label>)}
            </div>
            {plan !== "collector" && <p className="mt-3 text-xs leading-5 text-amber-200">No charge is made yet. Your selected plan is saved with your account; checkout is completed before any membership charge.</p>}
          </fieldset>
          <div>
            <label htmlFor="username" className="mb-2 block text-sm text-zinc-300">Public username</label>
            <input id="username" required minLength={3} maxLength={24} value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400" placeholder="CardCollector" />
            <p className="mt-2 text-xs text-zinc-500">This name appears automatically on your marketplace listings and offers.</p>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400"
              placeholder="you@example.com"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4 text-sm leading-6 text-zinc-200">
            <input type="checkbox" required checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-500" />
            <span>I have read and agree to the <a href="/terms" target="_blank" className="font-semibold text-amber-200 underline">Pull Theory Terms, PullShield inspection rules, trading and dispute rules, shipping and insurance responsibilities, privacy policy, and counterfeit-card policy</a>.</span>
          </label>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400"
              placeholder="Your password"
            />
          </div>

          {message && (
            <p className="rounded-xl bg-violet-500/10 p-3 text-sm text-violet-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account? {" "}
          <a href="/login" className="font-medium text-amber-300 hover:text-amber-200">
            Log in
          </a>
        </p>
      </div>

      {confirmationEmail && (
        <div
          aria-labelledby="confirm-email-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-3xl border border-violet-400/40 bg-zinc-950 p-7 text-center shadow-2xl shadow-violet-950/60">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/10 text-2xl text-emerald-200">
              ✓
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-violet-300">One more step</p>
            <h2 id="confirm-email-title" className="mt-2 text-3xl font-semibold text-white">Confirm your email</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              We sent a confirmation link to <span className="font-semibold text-white">{confirmationEmail}</span>.
            </p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm leading-6 text-zinc-300">
              <p><span className="font-semibold text-white">1.</span> Open your email inbox.</p>
              <p><span className="font-semibold text-white">2.</span> Click the Pull Theory confirmation link.</p>
              <p><span className="font-semibold text-white">3.</span> Return here and log in.</p>
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">Don&apos;t see it? Check your spam or junk folder. The confirmation email can take a few minutes to arrive.</p>
            <button
              type="button"
              onClick={() => setConfirmationEmail(null)}
              className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              I&apos;ll check my email
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
