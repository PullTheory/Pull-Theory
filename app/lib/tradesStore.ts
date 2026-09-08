import { createClient } from '@supabase/supabase-js';
import { recordLifecycleEvent } from './trafficStore';
import { decodeCardDetails, encodeCardDetails, type CardFinish } from './cardDetails';

export type Trade = {
  id: number;
  name: string;
  email: string;
  offeredCard: string;
  desiredCard: string;
  shippingAddress: string;
  notes?: string;
  agree?: boolean;
  user_id?: string | null;
  is_listing?: boolean;
  listing_id?: number | null;
  status?: 'pending' | 'countered' | 'accepted' | 'awaiting_shipment' | 'received' | 'authenticated' | 'return_shipped' | 'cancelled' | 'refused' | 'completed' | 'shipped' | 'verified' | 'fake' | 'sold';
  acceptedBy?: string[]; // emails of parties who accepted
  authenticatorAddress?: string | null;
  verificationResult?: string | null;
  created_at?: string | null;
  photoUrls?: string[];
  listingType?: "trade" | "sell" | "trade_or_sell";
  salePriceCents?: number | null;
  currency?: string;
};

let memory: Trade[] = [];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;
const authClient = SUPABASE_URL && (SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY!)
  : null;

function makeAuthenticatorAddress() {
  return process.env.PULL_THEORY_AUTHENTICATOR_ADDRESS || 'PULLSHIELD_ADDRESS_NOT_CONFIGURED';
}

export async function addTrade(t: Omit<Trade, 'id' | 'status' | 'acceptedBy' | 'authenticatorAddress' | 'verificationResult' | 'created_at'>) {
  if (supabase) {
    const { data, error } = await supabase.from('trades').insert([
      {
        name: t.name,
        email: t.email,
        user_id: (t as any).user_id || null,
        offered_card: t.offeredCard,
        desired_card: t.desiredCard,
        shipping_address: t.shippingAddress,
        notes: t.notes || null,
        is_listing: (t as any).is_listing || false,
        listing_id: (t as any).listing_id || null,
        photo_urls: t.photoUrls || [],
        listing_type: t.listingType || "trade",
        sale_price_cents: t.salePriceCents ?? null,
        currency: t.currency || "usd",
        agree: t.agree || false,
        status: 'pending',
      },
    ]).select('*').single();
    if (error) throw error;
    return normalizeRow(data as any);
  }

  const id = memory.length + 1;
  const trade: Trade = {
    id,
    ...t,
    status: 'pending',
    acceptedBy: [],
    authenticatorAddress: null,
    verificationResult: null,
    created_at: new Date().toISOString(),
    photoUrls: t.photoUrls || [],
    listingType: t.listingType || "trade",
    salePriceCents: t.salePriceCents ?? null,
    currency: t.currency || "usd",
  };
  memory.push(trade);
  return trade;
}

function normalizeRow(row: any): Trade {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    offeredCard: row.offered_card,
    desiredCard: row.desired_card,
    shippingAddress: row.shipping_address,
    notes: row.notes || undefined,
    agree: row.agree || false,
    status: row.status,
    acceptedBy: row.accepted_by || [],
    authenticatorAddress: row.authenticator_address || null,
    verificationResult: row.verification_result || null,
    user_id: row.user_id || null,
    is_listing: row.is_listing || false,
    listing_id: row.listing_id || null,
    created_at: row.created_at || null,
    photoUrls: Array.isArray(row.photo_urls) ? row.photo_urls.filter((url: unknown): url is string => typeof url === 'string') : [],
    listingType: row.listing_type === "sell" || row.listing_type === "trade_or_sell" ? row.listing_type : "trade",
    salePriceCents: typeof row.sale_price_cents === "number" ? row.sale_price_cents : null,
    currency: typeof row.currency === "string" ? row.currency : "usd",
  };
}

export async function getTrades(options?: { page?: number; pageSize?: number; user_id?: string | null; is_listing?: boolean | null; listing_id?: number | null; search?: string | null; }) {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const pageSize = options?.pageSize && options.pageSize > 0 ? options.pageSize : 50;
  const offset = (page - 1) * pageSize;

  if (supabase) {
    let query = supabase.from('trades').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (options?.user_id) query = query.eq('user_id', options.user_id);
    if (typeof options?.is_listing === 'boolean') query = query.eq('is_listing', options?.is_listing);
    if (options?.listing_id) query = query.eq('listing_id', options.listing_id);
    if (options?.search) {
      const s = `%${options.search}%`;
      query = query.or(`offered_card.ilike.${s},desired_card.ilike.${s},name.ilike.${s},email.ilike.${s}`);
    }

    const { data, error, count } = await query.range(offset, offset + pageSize - 1);
    if (error) throw error;
    return { items: (data || []).map(normalizeRow), total: count ?? (data || []).length, page, pageSize };
  }

  let items = memory.slice().reverse();
  if (options?.user_id) items = items.filter((t) => String(t.user_id) === String(options.user_id));
  if (typeof options?.is_listing === 'boolean') items = items.filter((t) => t.is_listing === options.is_listing);
  if (options?.listing_id) items = items.filter((t) => t.listing_id === options.listing_id);
  if (options?.search) {
    const s = options.search.toLowerCase();
    items = items.filter((t) => (t.offeredCard || '').toLowerCase().includes(s) || (t.desiredCard || '').toLowerCase().includes(s) || (t.name || '').toLowerCase().includes(s));
  }

  const total = items.length;
  items = items.slice(offset, offset + pageSize);
  return { items, total, page, pageSize };
}

export async function getTrade(id: number) {
  if (supabase) {
    const { data, error } = await supabase.from('trades').select('*').eq('id', id).single();
    if (error) return null;
    return normalizeRow(data as any);
  }
  return memory.find((t) => t.id === id) || null;
}

// Verify an access token and return the Supabase user (or null)
export async function getUserFromToken(token: string | null) {
  if (!token || !authClient) return null;
  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error) return null;
    return data.user || null;
  } catch (e) {
    return null;
  }
}

export async function updateShippingAddress(tradeId: number, userId: string, shippingAddress: string) {
  const trade = await getTrade(tradeId);
  if (!trade || String(trade.user_id) !== String(userId)) return null;
  if (supabase) {
    const { data, error } = await supabase.from('trades').update({ shipping_address: shippingAddress }).eq('id', tradeId).eq('user_id', userId).select('*').single();
    if (error) throw error;
    return normalizeRow(data as any);
  }
  trade.shippingAddress = shippingAddress;
  return trade;
}

export async function updateListingDetails(
  listingId: number,
  ownerUserId: string,
  listingType: "trade" | "sell" | "trade_or_sell",
  salePriceCents: number | null,
  finish: CardFinish,
) {
  const listing = await getTrade(listingId);
  if (!listing || !listing.is_listing || String(listing.user_id) !== String(ownerUserId) || listing.status !== "pending") {
    return null;
  }

  const desiredCard = listingType === "sell" ? "For sale" : "Open to offers";
  const normalizedPrice = listingType === "trade" ? null : salePriceCents;
  const notes = encodeCardDetails({ ...decodeCardDetails(listing.notes), finish });
  if (supabase) {
    const { data, error } = await supabase
      .from("trades")
      .update({ listing_type: listingType, sale_price_cents: normalizedPrice, desired_card: desiredCard, notes })
      .eq("id", listingId)
      .eq("user_id", ownerUserId)
      .eq("is_listing", true)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeRow(data) : null;
  }

  listing.listingType = listingType;
  listing.salePriceCents = normalizedPrice;
  listing.desiredCard = desiredCard;
  listing.notes = notes;
  return listing;
}

export async function acceptTrade(id: number, email: string) {
  if (supabase) {
    const t = await getTrade(id);
    if (!t) return null;
    const accepted = Array.isArray(t.acceptedBy) ? [...t.acceptedBy] : [];
    if (!accepted.includes(email)) accepted.push(email);
    const updates: any = { accepted_by: accepted };
    if (accepted.length >= 2) {
      updates.status = 'awaiting_shipment';
      updates.authenticator_address = makeAuthenticatorAddress();
    }
    const { data, error } = await supabase.from('trades').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    return normalizeRow(data as any);
  }

  const t = memory.find((x) => x.id === id);
  if (!t) return null;
  if (!t.acceptedBy) t.acceptedBy = [];
  if (!t.acceptedBy.includes(email)) t.acceptedBy.push(email);
  if (t.acceptedBy.length >= 2) {
    t.status = 'awaiting_shipment';
    t.authenticatorAddress = makeAuthenticatorAddress();
  }
  return t;
}

export async function verifyTrade(id: number, result: 'verified' | 'fake', note?: string) {
  if (supabase) {
    const updates: any = { status: result === 'verified' ? 'verified' : 'fake', verification_result: note || result };
    const { data, error } = await supabase.from('trades').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    return normalizeRow(data as any);
  }

  const t = memory.find((x) => x.id === id);
  if (!t) return null;
  if (result === 'verified') {
    t.status = 'verified';
    t.verificationResult = note || 'verified';
  } else {
    t.status = 'fake';
    t.verificationResult = note || 'fake';
  }
  return t;
}

export async function updateShipmentStatus(
  offerId: number,
  status: 'awaiting_shipment' | 'received' | 'authenticated' | 'return_shipped' | 'completed' | 'cancelled',
  reason?: string
) {
  const offer = await getTrade(offerId);
  if (!offer || !offer.listing_id) return null;
  const listing = await getTrade(offer.listing_id);
  if (!listing) return null;

  if (supabase) {
    const { data, error } = await supabase
      .from('trades')
      .update({ status, ...(reason ? { verification_result: reason } : {}) })
      .eq('id', offerId)
      .select('*')
      .single();
    if (error) throw error;
    const { error: listingError } = await supabase.from('trades').update({ status, ...(reason ? { verification_result: reason } : {}) }).eq('id', listing.id);
    if (listingError) throw listingError;
    const lifecycleEvent = status === "received" ? "cards_received" : status === "authenticated" ? "cards_verified" : status === "completed" ? "trade_completed" : null;
    if (lifecycleEvent) await Promise.allSettled([recordLifecycleEvent(offer.user_id, lifecycleEvent), recordLifecycleEvent(listing.user_id, lifecycleEvent)]);
    return { offer: normalizeRow(data as any), listing: { ...listing, status } };
  }

  offer.status = status;
  listing.status = status;
  return { offer, listing };
}

export async function deleteListing(listingId: number, ownerUserId: string) {
  const listing = await getTrade(listingId);
  if (!listing || !listing.is_listing || String(listing.user_id) !== String(ownerUserId)) {
    return { deleted: false, error: "Listing not found." };
  }

  if (listing.status && listing.status !== "pending") {
    return { deleted: false, error: "This listing already has an active or completed trade and cannot be deleted." };
  }

  if (supabase) {
    // Listings may have offers from other collectors. Permanently deleting
    // those rows can be blocked by database protections, which previously
    // left the card visible in the marketplace. Marking a pending listing as
    // cancelled removes it from every public marketplace query immediately,
    // preserves the collector's portfolio card, and retains a safe record.
    const { data: removedListing, error: removeListingError } = await supabase
      .from("trades")
      .update({ status: "cancelled" })
      .eq("id", listingId)
      .eq("user_id", ownerUserId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (removeListingError) throw removeListingError;
    if (!removedListing) {
      return { deleted: false, error: "This listing has already changed and can no longer be removed." };
    }

    // Pending offers are no longer actionable after the owner removes their
    // card. This is intentionally best-effort: the listing is already safely
    // hidden even if an older database policy prevents this secondary update.
    const { error: cancelOffersError } = await supabase
      .from("trades")
      .update({ status: "cancelled" })
      .eq("listing_id", listingId)
      .eq("status", "pending");
    if (cancelOffersError) console.error("[trades] unable to cancel related offers", cancelOffersError);
    return { deleted: true as const };
  }

  listing.status = "cancelled";
  memory.forEach((trade) => {
    if (trade.listing_id === listingId && trade.status === "pending") trade.status = "cancelled";
  });
  return { deleted: true as const };
}

export async function approveOffer(offerId: number, ownerUserId: string) {
  // ownerUserId must match the listing.user_id
  if (supabase) {
    const { data: offerData, error: offerErr } = await supabase.from('trades').select('*').eq('id', offerId).single();
    if (offerErr || !offerData) return null;
    const offer = normalizeRow(offerData as any);
    if (!offer.listing_id) return null;

    const { data: listingData, error: listingErr } = await supabase.from('trades').select('*').eq('id', offer.listing_id).single();
    if (listingErr || !listingData) return null;
    const listing = normalizeRow(listingData as any);
    if (String(listing.user_id) !== String(ownerUserId)) return null;

    // An accepted offer sends both parties into the authentication shipment stage.
    const shipmentUpdate = { status: 'awaiting_shipment', authenticator_address: makeAuthenticatorAddress() };
    const { data: offerUpdated, error: updErr } = await supabase.from('trades').update(shipmentUpdate).eq('id', offerId).select('*').single();
    if (updErr) throw updErr;
    await supabase.from('trades').update(shipmentUpdate).eq('id', listing.id);
    await Promise.allSettled([recordLifecycleEvent(offer.user_id, "offer_accepted"), recordLifecycleEvent(listing.user_id, "offer_accepted"), recordLifecycleEvent(offer.user_id, "pullshield_started"), recordLifecycleEvent(listing.user_id, "pullshield_started")]);

    // notify both parties about acceptance (if notification helper available)
    try {
      const { sendNotification } = await import('./notifications');
      if (offer.email) await sendNotification(offer.email, 'Your offer was accepted', `Your offer #${offerId} was accepted by the listing owner.`);
      if (listing.email) await sendNotification(listing.email, 'You accepted an offer', `You accepted an offer (#${offerId}) on your listing.`);
      const operatorEmail = process.env.PULL_THEORY_AUTHENTICATOR_EMAIL;
      if (operatorEmail) {
        await sendNotification(
          operatorEmail,
          'PullShield shipment awaiting cards',
          `Offer #${offerId} was accepted. Open PullShield Desk to securely view both collectors' shipping information.`
        );
      }
    } catch (e) {
      // ignore notification errors
    }

    return normalizeRow(offerUpdated as any);
  }

  const offer = memory.find((m) => m.id === offerId);
  if (!offer || !offer.listing_id) return null;
  const listing = memory.find((m) => m.id === offer.listing_id);
  if (!listing || String(listing.user_id) !== String(ownerUserId)) return null;
  offer.status = 'awaiting_shipment';
  offer.authenticatorAddress = makeAuthenticatorAddress();
  if (listing) {
    listing.status = 'awaiting_shipment';
    listing.authenticatorAddress = makeAuthenticatorAddress();
  }
  return offer;
}

export async function refuseOffer(offerId: number, ownerUserId: string) {
  const offer = await getTrade(offerId);
  if (!offer?.listing_id || offer.status !== 'pending') return null;
  const listing = await getTrade(offer.listing_id);
  if (!listing || String(listing.user_id) !== String(ownerUserId)) return null;

  if (supabase) {
    const { data, error } = await supabase
      .from('trades')
      .update({ status: 'refused' })
      .eq('id', offerId)
      .eq('status', 'pending')
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as any);
  }

  offer.status = 'refused';
  return offer;
}

export async function counterOffer(offerId: number, ownerUserId: string, counterTerms: string) {
  const offer = await getTrade(offerId);
  if (!offer?.listing_id || offer.status !== 'pending') return null;
  const listing = await getTrade(offer.listing_id);
  if (!listing || String(listing.user_id) !== String(ownerUserId)) return null;

  const notes = `Counter offer: ${counterTerms}`;
  if (supabase) {
    const { data, error } = await supabase
      .from('trades')
      .update({ status: 'countered', notes })
      .eq('id', offerId)
      .eq('status', 'pending')
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as any);
  }

  offer.status = 'countered';
  offer.notes = notes;
  return offer;
}
