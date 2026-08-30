import { createClient } from '@supabase/supabase-js';

export type Trade = {
  id: number;
  name: string;
  email: string;
  offeredCard: string;
  desiredCard: string;
  shippingAddress: string;
  notes?: string;
  agree?: boolean;
  status?: 'pending' | 'accepted' | 'awaiting_shipment' | 'shipped' | 'verified' | 'fake';
  acceptedBy?: string[]; // emails of parties who accepted
  authenticatorAddress?: string | null;
  verificationResult?: string | null;
  created_at?: string | null;
};

let memory: Trade[] = [];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

function makeAuthenticatorAddress() {
  return process.env.NEXT_PUBLIC_AUTHENTICATOR_ADDRESS || 'AUTHENTICATOR_ADDRESS_PLACEHOLDER';
}

export async function addTrade(t: Omit<Trade, 'id' | 'status' | 'acceptedBy' | 'authenticatorAddress' | 'verificationResult' | 'created_at'>) {
  if (supabase) {
    const { data, error } = await supabase.from('trades').insert([
      {
        name: t.name,
        email: t.email,
        offered_card: t.offeredCard,
        desired_card: t.desiredCard,
        shipping_address: t.shippingAddress,
        notes: t.notes || null,
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
    created_at: row.created_at || null,
  };
}

export async function getTrades() {
  if (supabase) {
    const { data, error } = await supabase.from('trades').select('*').order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map(normalizeRow);
  }
  return memory;
}

export async function getTrade(id: number) {
  if (supabase) {
    const { data, error } = await supabase.from('trades').select('*').eq('id', id).single();
    if (error) return null;
    return normalizeRow(data as any);
  }
  return memory.find((t) => t.id === id) || null;
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
