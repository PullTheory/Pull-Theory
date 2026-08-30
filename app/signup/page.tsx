"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase client not available.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else if (data?.user) {
      setMessage("Signup successful! Please check your email to confirm your account.");
    } else {
      setMessage("Signup request sent. Check your inbox for confirmation.");
    }

    setLoading(false);
  }

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
        <p className="mt-2 text-zinc-400">Sign up to start tracking your collection.</p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
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
    </main>
  );
}
