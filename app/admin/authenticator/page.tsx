"use client";

import { useEffect, useState } from 'react';

export default function AuthenticatorAdmin() {
  const [trades, setTrades] = useState<any[]>([]);
  const [secret, setSecret] = useState('');

  useEffect(() => {
    fetch('/api/trades')
      .then((r) => r.json())
      .then((data) => setTrades((data || []).filter((t: any) => t.status === 'awaiting_shipment' || t.status === 'shipped')))
      .catch(() => setTrades([]));
  }, []);

  async function mark(tradeId: number, result: 'verified' | 'fake') {
    if (!secret) {
      alert('Enter authenticator secret');
      return;
    }
    const res = await fetch(`/api/trades/${tradeId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-authenticator-secret': secret },
      body: JSON.stringify({ result }),
    });
    const body = await res.json();
    if (res.ok) {
      alert('Marked ' + result);
      setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    } else {
      alert(body.error || 'Failed');
    }
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4">Authenticator Admin</h1>
      <div className="mb-4">
        <label className="block text-sm">Authenticator secret</label>
        <input value={secret} onChange={(e) => setSecret(e.target.value)} className="mt-1 block w-full border rounded p-2" />
      </div>
      <section>
        <h2 className="font-semibold mb-3">Pending verifications</h2>
        <ul className="space-y-3">
          {trades.map((t) => (
            <li key={t.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.offeredCard} (#{t.id})</div>
                <div className="text-sm text-gray-600">Status: {t.status}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => mark(t.id, 'verified')} className="px-3 py-1 bg-emerald-600 text-white rounded">Verify</button>
                <button onClick={() => mark(t.id, 'fake')} className="px-3 py-1 bg-rose-600 text-white rounded">Mark fake</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
