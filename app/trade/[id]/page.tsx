"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';

type Trade = any;

export default function TradeDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/trades/${id}/accept`)
      .then((r) => r.json())
      .then((data) => setTrade(data))
      .catch(() => setTrade(null));
  }, [id]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      let token: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || null;
      }

      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/trades/${id}/accept`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (res.ok) {
        setTrade(body.trade);
      } else {
        alert(body.error || 'Failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (!trade) return <div className="p-6">Loading...</div>;

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-2">Trade #{trade.id}</h1>
      <div className="mb-4">
        <div><strong>Offered:</strong> {trade.offeredCard}</div>
        <div><strong>Desired:</strong> {trade.desiredCard}</div>
        <div><strong>By:</strong> {trade.name} &lt;{trade.email}&gt;</div>
        <div><strong>Status:</strong> {trade.status}</div>
        {trade.authenticatorAddress && (
          <div><strong>Authenticator address:</strong> {trade.authenticatorAddress}</div>
        )}
      </div>

      <form onSubmit={handleAccept} className="space-y-3">
        <div>
          <label className="block text-sm">Your email to accept</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Accepting...' : 'Accept Trade'}</button>
        </div>
      </form>
    </main>
  );
}
