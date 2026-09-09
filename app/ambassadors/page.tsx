import Link from "next/link";

const steps=[
  {n:"01",title:"Join",body:"Use your existing PullTheory account or create one in under a minute."},
  {n:"02",title:"Get your link",body:"Open the Ambassador Dashboard and create a unique referral code and link."},
  {n:"03",title:"Share",body:"Post your link in your collector content, bio, groups, videos, or send it directly to friends."},
  {n:"04",title:"Earn",body:"Get $0.50 for each legitimate verified signup, plus $5 when that collector becomes a paid member."},
];

export default function AmbassadorsPage(){return <main className="min-h-screen px-5 py-12 text-white"><section className="mx-auto max-w-5xl">
  <div className="rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-500/15 via-black/20 to-amber-400/10 p-7 sm:p-10">
    <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">PullTheory Ambassador Program</p>
    <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Turn your collector network into rewards.</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">Help collectors discover a safer way to buy, sell, and trade cards with PullShield protection. You bring the collectors. PullTheory tracks the results.</p>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/ambassadors/dashboard" className="rounded-2xl bg-violet-600 px-6 py-4 text-center font-bold hover:bg-violet-500">Start earning →</Link><a href="#how-it-works" className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-center font-semibold">See how it works</a></div>
    <p className="mt-3 text-sm text-zinc-400">Already have an account? Keep it — no second account needed.</p>
  </div>

  <div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-3xl border border-violet-400/25 bg-violet-500/[0.08] p-7"><p className="text-4xl font-black text-violet-200">$0.50</p><p className="mt-2 font-semibold">for every verified signup</p><p className="mt-2 text-sm text-zinc-400">Unique, legitimate accounts that confirm their email qualify.</p></div><div className="rounded-3xl border border-emerald-400/25 bg-emerald-500/[0.07] p-7"><p className="text-4xl font-black text-emerald-200">+$5.00</p><p className="mt-2 font-semibold">when they become a paid member</p><p className="mt-2 text-sm text-zinc-400">The paid-member reward is added on top of the signup reward.</p></div></div>

  <section id="how-it-works" className="mt-12"><p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Your ambassador funnel</p><h2 className="mt-2 text-3xl font-bold">Four steps from collector to reward</h2><div className="mt-6 grid gap-4 md:grid-cols-4">{steps.map(s=><div key={s.n} className="rounded-3xl border border-white/10 bg-black/30 p-6"><span className="text-sm font-black text-amber-300">{s.n}</span><h3 className="mt-3 text-xl font-bold">{s.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{s.body}</p></div>)}</div></section>

  <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-7"><h2 className="text-2xl font-bold">What happens after someone clicks your link?</h2><div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold"><span className="rounded-full bg-violet-500/15 px-4 py-2 text-violet-200">Your link</span><span className="text-zinc-600">→</span><span className="rounded-full bg-white/10 px-4 py-2">Signup</span><span className="text-zinc-600">→</span><span className="rounded-full bg-white/10 px-4 py-2">Email verified</span><span className="text-zinc-600">→</span><span className="rounded-full bg-emerald-500/15 px-4 py-2 text-emerald-200">$0.50 earned</span><span className="text-zinc-600">→</span><span className="rounded-full bg-amber-500/15 px-4 py-2 text-amber-200">Paid member +$5</span></div><p className="mt-5 text-sm leading-6 text-zinc-400">Your Ambassador Dashboard shows your verified referrals, paid-member conversions, total earned, paid amount, and amount owed.</p></section>

  <section className="mt-10 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-7 text-center"><h2 className="text-3xl font-black">Ready to bring collectors to PullTheory?</h2><p className="mx-auto mt-3 max-w-xl text-zinc-300">Create your code, copy your personal link, and start sharing. Your dashboard handles the tracking.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/ambassadors/dashboard" className="rounded-2xl bg-violet-600 px-7 py-4 font-bold">Open Ambassador Dashboard</Link><Link href="/signup?returnTo=%2Fambassadors%2Fdashboard" className="rounded-2xl border border-white/15 px-7 py-4 font-semibold">Create a PullTheory account</Link></div></section>

  <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-zinc-500">Self-referrals, duplicate or fake accounts, automated signups, and other abuse do not qualify. Rewards may be reviewed before payment. Program rates may change for future referrals.</p>
</section></main>}
