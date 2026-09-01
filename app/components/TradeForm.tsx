"use client";

import { useState } from 'react';
import { getCurrentAccessToken } from '../lib/supabase';

export default function TradeForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form) as any);
    setLoading(true);
    setMessage(null);
    try {
      const token = await getCurrentAccessToken();

      if (!token) {
        setMessage('You must be signed in to create a trade.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (res.ok) {
        setMessage('Trade submitted. We will follow up with the authenticator address.');
        form.reset();
      } else {
        setMessage(body?.error || 'Submission failed');
      }
    } catch (err) {
      setMessage('Network error while submitting trade');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Your name</label>
        <input name="name" required className="mt-1 block w-full border rounded p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="mt-1 block w-full border rounded p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Card you're offering</label>
        <input name="offeredCard" required className="mt-1 block w-full border rounded p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Card you want</label>
        <input name="desiredCard" required className="mt-1 block w-full border rounded p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Shipping address</label>
        <textarea name="shippingAddress" required className="mt-1 block w-full border rounded p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Additional notes (optional)</label>
        <textarea name="notes" className="mt-1 block w-full border rounded p-2" />
      </div>

      <div className="flex items-center space-x-2">
        <input id="agree" name="agree" type="checkbox" required />
        <label htmlFor="agree" className="text-sm">I agree to ship my card to the authenticator and accept the verification policy.</label>
      </div>

      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Submitting...' : 'Submit Trade'}
        </button>
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </form>
  );
}
