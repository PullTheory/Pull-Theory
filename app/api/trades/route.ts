import { NextResponse } from 'next/server';
import { addTrade, getTrades } from '../../lib/tradesStore';
import { sendNotification } from '../../lib/notifications';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const required = ['name', 'email', 'offeredCard', 'desiredCard', 'shippingAddress', 'agree'];
    for (const k of required) {
      if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });
    }
    const trade = await addTrade({
      name: String(body.name),
      email: String(body.email),
      offeredCard: String(body.offeredCard),
      desiredCard: String(body.desiredCard),
      shippingAddress: String(body.shippingAddress),
      notes: body.notes ? String(body.notes) : undefined,
    });

    // notify the submitter with trade id and next steps
    try {
      await sendNotification(trade.email, 'Trade submitted', `Your trade (#${trade.id}) was submitted. We'll notify you when the other party accepts.`);
    } catch (e) {
      // ignore notification failures
    }

    return NextResponse.json({ status: 'ok', id: trade.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const list = await getTrades();
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
