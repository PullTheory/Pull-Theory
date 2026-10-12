import Link from "next/link";

const giveawayCards = [
  "Pikachu — PSA 10",
  "Swablu — PSA 9",
  "Giovanni's Exile (Full Art) — PSA 9",
  "Iono's Kilowattrel — PSA 8",
  "Team Rocket's Orbeetle — PSA 9",
];

export default function GiveawayBanner({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-amber-300/60 bg-[#111109] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:px-10 sm:py-10">
      <div className="mx-auto max-w-4xl text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[.28em] text-amber-300">
          <span aria-hidden="true">🎁</span> Membership Giveaway
        </p>
        <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-.04em] text-white sm:text-6xl">
          Win all 5 graded Pokémon cards.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
          A paid PullTheory membership is required to enter. One winner receives the entire five-card bundle. A value of <strong className="text-white">$150.</strong>
        </p>

        <Link
          href={signedIn ? "/pricing" : "/signup?returnTo=/pricing"}
          className="mx-auto mt-7 block w-full max-w-xl rounded-2xl bg-amber-300 px-5 py-4 text-center text-base font-black uppercase tracking-wide text-black shadow-[0_10px_35px_rgba(251,191,36,.2)] transition hover:bg-amber-200 sm:text-lg"
        >
          View Membership
        </Link>

        <div className="mx-auto mt-8 flex max-w-3xl justify-center rounded-2xl px-2 py-2 sm:mt-10 sm:px-8">
          <img
            src="/giveaway-slabs.svg"
            alt="All five PSA graded Pokémon cards included in the Pull Theory membership giveaway"
            className="h-auto w-full max-w-3xl object-contain"
          />
        </div>

        <div className="mx-auto mt-5 grid max-w-2xl gap-2 text-center text-sm font-bold leading-6 text-zinc-100 sm:text-base">
          {giveawayCards.map((card) => (
            <p key={card}>{card}</p>
          ))}
        </div>

        <p className="mt-7 text-lg font-black text-amber-200 sm:text-xl">
          Winner selected 11/11/2026.
        </p>
      </div>
    </section>
  );
}
