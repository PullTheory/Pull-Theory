"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OfferModal from '../../components/OfferModal';
import { getSupabaseClient } from '../../lib/supabase';

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/trades/${id}/accept`);
      const l = await r.json();
      setListing(r.ok ? l : null);

    } catch (e) {
      setListing(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function openOffer() {
    const supabase = getSupabaseClient();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    if (!data.session?.user) {
      router.push('/signup');
      return;
    }
    setModalOpen(true);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!listing) return <div className="p-6">Listing not found.</div>;

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{listing.offeredCard}</h1>
        <div>
          <button onClick={() => void openOffer()} className="px-3 py-1 bg-emerald-600 text-white rounded mr-2">Offer trade</button>
          <button onClick={() => router.push('/marketplace')} className="px-3 py-1 border rounded">Back</button>
        </div>
      </div>

      <div className="mb-6">
        {listing.photoUrls?.length ? <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{listing.photoUrls.slice(0, 4).map((url: string, index: number) => <img key={url} src={url} alt={`${listing.offeredCard} photo ${index + 1}`} className="aspect-[2.5/3.5] w-full rounded-2xl border border-white/10 bg-black/25 object-contain" />)}</div> : null}
        <p><strong>Posted by:</strong> {listing.name}</p>
        {listing.desiredCard && <p><strong>Desired:</strong> {listing.desiredCard}</p>}
      </div>

      {modalOpen && <OfferModal listing={listing} onClose={() => setModalOpen(false)} onSubmitted={() => load()} />}
    </main>
  );
}
