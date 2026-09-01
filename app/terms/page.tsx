const sections = [
  {
    title: "1. PullShield service",
    content:
      "PullShield is an optional card-authentication and trade-forwarding service. Pull Theory does not buy cards, sell cards, set a card's value, hold money for a trade, or guarantee that a trade will be completed. Collectors remain responsible for agreeing on the cards being exchanged and for the accuracy of each listing.",
  },
  {
    title: "2. Inspection rules",
    content:
      "Each submitted card is inspected for authenticity, material condition, and whether it reasonably matches the trade listing. PullShield may photograph the card and its packaging, record visible flaws, and decline any card that appears altered, counterfeit, materially different from its listing, damaged in transit, or unsafe to handle. Authentication and condition opinions are made in good faith using the information and examination available at the time; they are not a grading certification or a guarantee of future value.",
  },
  {
    title: "3. Time limits",
    content:
      "Both collectors must ship their cards within 5 calendar days after receiving shipping instructions, unless the trade details state a different deadline. After both cards have been received, PullShield aims to complete inspection within 5 business days. Delays may occur for shipping interruptions, high submission volume, incomplete documentation, fraud review, holidays, or circumstances outside Pull Theory's control. A trade may be cancelled if either card is not shipped by its deadline.",
  },
  {
    title: "4. Shipping and insurance",
    content:
      "Each collector is responsible for safely packaging and shipping their own card to PullShield using the shipping method and tracking requirements shown in the trade. Collectors are responsible for inbound postage, declared-value coverage, and any carrier insurance unless the trade checkout clearly states otherwise. Outbound postage, insurance, and signature confirmation are quoted separately and paid by the collector selected during checkout. Pull Theory is not responsible for loss, theft, delay, or damage that occurs while a package is with a carrier; claims must be made with the carrier that handled the shipment.",
  },
  {
    title: "5. If a card fails authentication or does not match",
    content:
      "If either card fails inspection or materially differs from its listing, PullShield will pause the trade and notify both collectors. The failing card will not be forwarded to the other collector. Unless fraud, law enforcement, carrier rules, or a documented dispute requires a different outcome, each card will be returned to its original sender. Return shipping, insurance, and any non-refundable service fees are handled according to the trade checkout details. Pull Theory may restrict or remove accounts involved in counterfeit, misleading, stolen, or repeated non-compliant submissions.",
  },
  {
    title: "6. Disputes and updates",
    content:
      "Report a shipping or inspection concern within 14 calendar days of the status update or delivery date. Pull Theory may request photos, tracking records, packaging details, and other information needed to investigate. We may update these terms as PullShield develops; the terms shown when a trade is submitted apply to that trade unless a change is required by law or is more favorable to the collector.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white sm:py-16">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.22),transparent_38%),radial-gradient(circle_at_10%_70%,rgba(251,191,36,0.1),transparent_28%)]" />
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300 transition hover:text-white">← Pull Theory HQ</a>
        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">PullShield policies</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Terms for protected card trades.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">These terms explain how PullShield inspections, trade timelines, shipping, insurance, and failed authentications work. Please read them before submitting a protected trade.</p>

        <div className="mt-12 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_18px_60px_rgba(124,58,237,0.08)] backdrop-blur sm:p-8">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-4 leading-7 text-zinc-300">{section.content}</p>
            </section>
          ))}
        </div>


        <p className="mt-10 text-sm leading-6 text-zinc-500">Last updated: August 30, 2026. These operating terms should be reviewed by a qualified attorney before PullShield is offered to the public.</p>
      </div>
    </main>
  );
}
