import Link from "next/link";

const giveawayCards = [
  { name: "Pikachu", grade: "PSA 10", image: "https://static.tcgcollector.com/content/images/2a/24/4a/2a244a268957ff780a18249ba4edab432e37ce3f16e415e49aa7a0601f29ac58.webp" },
  { name: "Swablu", grade: "PSA 9", image: "https://images.pokemontcg.io/swsh12pt5gg/GG27_hires.png" },
  { name: "Giovanni's Exile (Full Art)", grade: "PSA 9", image: "https://images.pokemontcg.io/sm115/67_hires.png" },
  { name: "Iono's Kilowattrel", grade: "PSA 8", image: "https://static.tcgcollector.com/content/images/ba/01/02/ba010257f52ea148acc1bb003a6a855babe006032b4b2f729a28cf3b7ce1c78b.webp" },
  { name: "Team Rocket's Orbeetle", grade: "PSA 9", image: "https://images.pokemontcg.io/sv10/198_hires.png" },
];

const fanStyles = [
  { transform: "translate(calc(-50% - 108px), 24px) rotate(-18deg)", zIndex: 1 },
  { transform: "translate(calc(-50% - 54px), 8px) rotate(-9deg)", zIndex: 2 },
  { transform: "translate(-50%, -4px) rotate(0deg)", zIndex: 3 },
  { transform: "translate(calc(-50% + 54px), 8px) rotate(9deg)", zIndex: 2 },
  { transform: "translate(calc(-50% + 108px), 24px) rotate(18deg)", zIndex: 1 },
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

        <div className="mx-auto mt-8 h-[250px] w-full max-w-[620px] sm:mt-10 sm:h-[330px]" aria-label="Five PSA graded Pokémon cards">
          <div className="relative mx-auto h-full w-full max-w-[520px]">
            {giveawayCards.map((card, index) => (
              <div
                key={card.name}
                className="absolute left-1/2 top-0 w-[104px] overflow-hidden rounded-[10px] border-2 border-zinc-300 bg-zinc-500 p-[3px] shadow-[0_12px_28px_rgba(0,0,0,.55)] sm:w-[140px] sm:rounded-xl sm:p-1"
                style={fanStyles[index]}
              >
                <div className="rounded-[6px] border border-zinc-700 bg-white p-[2px] sm:rounded-lg sm:p-1">
                  <img
                    src={card.image}
                    alt={`${card.name} ${card.grade}`}
                    loading="eager"
                    decoding="async"
                    className="block h-auto w-full rounded-[4px] object-cover sm:rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between px-1 py-1 text-[9px] font-black uppercase tracking-tight text-white sm:px-2 sm:py-1.5 sm:text-[11px]">
                  <span>PSA</span><span>{card.grade.replace("PSA ", "")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-2 grid max-w-2xl gap-2 text-center text-sm font-bold leading-6 text-zinc-100 sm:text-base">
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
