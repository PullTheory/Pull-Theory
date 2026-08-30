import { NextResponse } from 'next/server';
import { verifyTrade, getTrade } from '../../../../lib/tradesStore';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const body = await req.json();
    const result = body?.result;
    if (!result || (result !== 'verified' && result !== 'fake')) return NextResponse.json({ error: 'result required (verified|fake)' }, { status: 400 });

    const trade = await verifyTrade(id, result, body?.note);
    if (!trade) return NextResponse.json({ error: 'not found' }, { status: 404 });

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
