export type CardFinish = "holo" | "reverse_holo";

export type CardDetails = {
  setName?: string;
  cardNumber?: string;
  year?: string;
  gradingStatus?: "raw" | "graded";
  gradingCompany?: string;
  grade?: string;
  condition?: string;
  estimatedValue?: string;
  collectorNotes?: string;
  finish?: CardFinish;
};

const PREFIX = "PT_CARD_DETAILS:";

export function encodeCardDetails(details: CardDetails) {
  const clean = Object.fromEntries(
    Object.entries(details).filter(([, value]) => typeof value === "string" && value.trim()),
  );
  return `${PREFIX}${encodeURIComponent(JSON.stringify(clean))}`;
}

export function decodeCardDetails(notes?: string | null): CardDetails {
  if (!notes?.startsWith(PREFIX)) return { collectorNotes: notes || undefined };
  try {
    return JSON.parse(decodeURIComponent(notes.slice(PREFIX.length))) as CardDetails;
  } catch {
    return { collectorNotes: notes };
  }
}

export function formatCardTitle(name: string, details: CardDetails) {
  const suffix = [details.year, details.setName, details.cardNumber && `#${details.cardNumber}`]
    .filter(Boolean)
    .join(" · ");
  return suffix ? `${name.trim()} — ${suffix}` : name.trim();
}

export function cardFinishLabel(finish?: CardFinish) {
  return finish === "holo" ? "Holo" : finish === "reverse_holo" ? "Reverse Holo" : undefined;
}
