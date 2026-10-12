import Link from "next/link";

const giveawayCards = [
  { name: "Pikachu", grade: "PSA 10", image: "https://images.pokemontcg.io/svp/214_hires.png" },
  { name: "Swablu", grade: "PSA 9", image: "https://images.pokemontcg.io/swsh12pt5gg/GG27_hires.png" },
  { name: "Giovanni's Exile (Full Art)", grade: "PSA 9", image: "https://images.pokemontcg.io/sm115/67_hires.png" },
  { name: "Iono's Kilowattrel", grade: "PSA 8", image: "https://images.pokemontcg.io/sv09/163_hires.png" },
  { name: "Team Rocket's Orbeetle", grade: "PSA 9", image: "https://images.pokemontcg.io/sv10/198_hires.png" },
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

        <div className="mx-auto mt-8 max-w-3xl px-1 sm:mt-10 sm:px-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {giveawayCards.map((card) => (
              <div key={card.name} className="overflow-hidden rounded-xl border border-white/40 bg-zinc-200 p-1 shadow-[0_8px_24px_rgba(0,0,0,.35)]">
                <img
                  src={card.image}
                  alt={`${card.name} ${card.grade}`}
                  loading="eager"
                  decoding="async"
                  className="block h-auto w-full rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-5 grid max-w-2xl gap-2 text-center text-sm font-bold leading-6 text-zinc-100 sm:text-base">
          {giveawayCards.map((card) => (
            <p key={card.name}>{card.name} — {card.grade}</p>
          ))}
        </div>

        <p className="mt-7 text-lg font-black text-amber-200 sm:text-xl">
          Winner selected 11/11/2026.
        </p>
      </div>
    </section>
  );
}
