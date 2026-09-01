"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Trade = {
  id: number;
  name: string;
  email: string;
  offeredCard: string;
  desiredCard: string;
  status?: string;
};

export default function TradeListPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    fetch('/api/trades')
      .then((r) => r.json())
      .then(setTrades)
      .catch(() => setTrades([]));
  }, []);

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Trades</h1>
      <ul className="space-y-3">
        {trades.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{t.offeredCard} → {t.desiredCard}</div>
                <div className="text-sm text-gray-600">By {t.name} ({t.email})</div>
              </div>
              <div className="text-sm text-gray-700">{t.status}</div>
            </div>
            <div className="mt-2">
              <Link href={`/trade/${t.id}`} className="text-blue-600">View</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
