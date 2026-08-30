import { NextResponse } from 'next/server';
import { acceptTrade, getTrade } from '../../../../lib/tradesStore';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const body = await req.json();
    const email = body?.email;
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const trade = await acceptTrade(id, String(email));
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const trade = await getTrade(id);
  if (!trade) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(trade);
}
