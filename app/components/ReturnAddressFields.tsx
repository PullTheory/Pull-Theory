"use client";

import { useEffect, useState } from "react";

export type ReturnAddress = { street: string; unit: string; city: string; state: string; zip: string };

export function formatReturnAddress(address: ReturnAddress) {
  return [address.street, address.unit, [address.city, address.state].filter(Boolean).join(", "), address.zip].filter(Boolean).join(" · ");
}

export default function ReturnAddressFields({ value, onChange }: { value: ReturnAddress; onChange: (address: ReturnAddress) => void }) {
  const [lookupMessage, setLookupMessage] = useState("");

  useEffect(() => {
    if (value.zip.length !== 5) return;
    let cancelled = false;
    async function fillLocation() {
      setLookupMessage("Finding city and state...");
      try {
        const response = await fetch(`/api/address/zip?zip=${value.zip}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "ZIP code not found.");
        if (!cancelled) {
          onChange({ ...value, city: data.city, state: data.state });
          setLookupMessage("City and state filled from ZIP code.");
        }
      } catch (error) {
        if (!cancelled) setLookupMessage(error instanceof Error ? error.message : "ZIP code not found.");
      }
    }
    void fillLocation();
    return () => { cancelled = true; };
  }, [value.zip]);

  const inputClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-violet-400";
  const update = (field: keyof ReturnAddress, next: string) => onChange({ ...value, [field]: field === "zip" ? next.replace(/\D/g, "").slice(0, 5) : next });

  return <fieldset className="rounded-2xl border border-white/10 bg-black/15 p-4"><legend className="px-2 text-sm font-semibold text-zinc-200">Secure return address</legend><p className="mb-4 text-xs leading-5 text-zinc-400">Private—only used after a trade is accepted. ZIP code fills city and state automatically.</p><label className="block text-sm text-zinc-300">Street address<input value={value.street} onChange={(event) => update("street", event.target.value)} required autoComplete="street-address" placeholder="123 Card Street" className={inputClass} /></label><label className="mt-4 block text-sm text-zinc-300">Apartment, suite, etc. <span className="text-zinc-500">optional</span><input value={value.unit} onChange={(event) => update("unit", event.target.value)} autoComplete="address-line2" placeholder="Apt 4" className={inputClass} /></label><div className="mt-4 grid gap-4 sm:grid-cols-[1fr_9rem]"><label className="block text-sm text-zinc-300">ZIP code<input value={value.zip} onChange={(event) => update("zip", event.target.value)} required inputMode="numeric" autoComplete="postal-code" placeholder="12345" className={inputClass} /></label><label className="block text-sm text-zinc-300">State<input value={value.state} onChange={(event) => update("state", event.target.value.toUpperCase().slice(0, 2))} required autoComplete="address-level1" placeholder="KY" className={inputClass} /></label></div><label className="mt-4 block text-sm text-zinc-300">City<input value={value.city} onChange={(event) => update("city", event.target.value)} required autoComplete="address-level2" placeholder="Your city" className={inputClass} /></label>{lookupMessage && <p className="mt-3 text-xs text-violet-200">{lookupMessage}</p>}</fieldset>;
}
