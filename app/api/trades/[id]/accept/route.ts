import { NextResponse } from 'next/server';
import { acceptTrade, getTrade } from '../../../../lib/tradesStore';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const { id: idParam } = await params;
  try {
    const id = Number(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const { getUserFromToken } = await import('../../../../lib/tradesStore');
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'authentication required' }, { status: 401 });

    const trade = await acceptTrade(id, String(user.email));
    if (!trade) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // if both parties have accepted, notify them with the authenticator address
    try {
      if (trade.status === 'awaiting_shipment' && Array.isArray(trade.acceptedBy)) {
        const addr = trade.authenticatorAddress || process.env.NEXT_PUBLIC_AUTHENTICATOR_ADDRESS;
        for (const e of trade.acceptedBy) {
          await import('../../../../lib/notifications').then(({ sendNotification }) => sendNotification(e, 'Trade ready for shipment', `Both parties accepted. Ship to: ${addr}`));
        }
      }
    } catch (e) {
      // ignore email errors
    }

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
  if (!trade || !trade.is_listing || (trade.status && trade.status !== 'pending')) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  // A marketplace page is public. Keep the seller's email and return address
  // private until a trade has been accepted and the protected workflow begins.
  const { email: _email, shippingAddress: _shippingAddress, acceptedBy: _acceptedBy, authenticatorAddress: _authenticatorAddress, ...publicTrade } = trade;
  return NextResponse.json(publicTrade);
}
