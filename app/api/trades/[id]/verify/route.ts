import { NextResponse } from 'next/server';
import { verifyTrade, getTrade } from '../../../../lib/tradesStore';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const body = await req.json();
    const result = body?.result;
    if (!result || (result !== 'verified' && result !== 'fake')) return NextResponse.json({ error: 'result required (verified|fake)' }, { status: 400 });
    // require authenticator secret header for verification
    const secret = req.headers.get('x-authenticator-secret');
    if (!secret || secret !== process.env.AUTHENTICATOR_SECRET) {
      return NextResponse.json({ error: 'authenticator authentication required' }, { status: 401 });
    }

    const { verifyTrade } = await import('../../../../lib/tradesStore');
    const trade = await verifyTrade(id, result, body?.note);
    if (!trade) return NextResponse.json({ error: 'not found' }, { status: 404 });

    return NextResponse.json({ status: 'ok', trade });
  } catch (err: any) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const trade = await getTrade(id);
  if (!trade) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const { email: _email, shippingAddress: _shippingAddress, acceptedBy: _acceptedBy, authenticatorAddress: _authenticatorAddress, ...publicTrade } = trade;
  return NextResponse.json(publicTrade);
}
