"use client";

import { FormEvent, useMemo, useState } from "react";

type Entrant = {
  id: string;
  username: string;
  email: string;
  signedUpAt: string;
  emailConfirmed: boolean;
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function GiveawayAdminPage() {
  const [secret, setSecret] = useState("");
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const confirmedCount = useMemo(() => entrants.filter((entrant) => entrant.emailConfirmed).length, [entrants]);

  async function loadEntrants(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/giveaway-entrants", {
        headers: { "x-authenticator-secret": secret },
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not load entrants.");
      setEntrants(body.entrants || []);
      setUnlocked(true);
    } catch (loadError) {
      setUnlocked(false);
      setError(loadError instanceof Error ? loadError.message : "Could not load entrants.");
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    const rows = [
      ["Username", "Email", "Sign-up date", "Email confirmed"],
      ...entrants.map((entrant) => [entrant.username, entrant.email, new Date(entrant.signedUpAt).toLocaleString(), entrant.emailConfirmed ? "Yes" : "No"]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pull-theory-giveaway-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Pull Theory HQ</a>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Private admin page</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Giveaway entrants</h1>
            <p className="mt-2 text-zinc-400">Every Pull Theory account is added automatically.</p>
          </div>
          {unlocked && <button type="button" onClick={downloadCsv} className="rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">Download CSV</button>}
        </div>

        {!unlocked ? (
          <form onSubmit={loadEntrants} className="mt-8 max-w-md rounded-3xl border border-violet-500/30 bg-white/5 p-6">
            <label htmlFor="admin-secret" className="block text-sm font-medium text-zinc-200">Admin secret</label>
            <input id="admin-secret" type="password" required value={secret} onChange={(event) => setSecret(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-violet-400" />
            {error && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={loading} className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-60">{loading ? "Opening…" : "View entrants"}</button>
          </form>
        ) : (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-5"><p className="text-sm text-violet-200">Total sign-ups</p><p className="mt-1 text-3xl font-semibold">{entrants.length}</p></div>
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5"><p className="text-sm text-emerald-200">Confirmed emails</p><p className="mt-1 text-3xl font-semibold">{confirmedCount}</p></div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-white/10 text-sm text-zinc-300"><tr><th className="px-5 py-4">Username</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Signed up</th><th className="px-5 py-4">Confirmed</th></tr></thead><tbody className="divide-y divide-white/10 bg-white/[0.03]">{entrants.map((entrant) => (<tr key={entrant.id} className="text-sm"><td className="px-5 py-4 font-medium">{entrant.username}</td><td className="px-5 py-4 text-zinc-300">{entrant.email}</td><td className="px-5 py-4 text-zinc-400">{new Date(entrant.signedUpAt).toLocaleString()}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${entrant.emailConfirmed ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>{entrant.emailConfirmed ? "Yes" : "Pending"}</span></td></tr>))}{entrants.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-zinc-400">No sign-ups yet.</td></tr>}</tbody></table></div></div>
            <button type="button" disabled={loading} onClick={() => loadEntrants()} className="mt-4 text-sm font-semibold text-violet-300 hover:text-violet-200">{loading ? "Refreshing…" : "Refresh list"}</button>
          </>
        )}
        <p className="mt-8 max-w-2xl text-xs leading-5 text-zinc-500">Entrant emails are private. Use this page only for managing the Pull Theory giveaway and do not share the exported list publicly.</p>
      </div>
    </main>
  );
}
