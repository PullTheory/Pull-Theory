import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const { id: idParam } = await params;
  try {
    const id = Number(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const { getUserFromToken, approveOffer } = await import('../../../../lib/tradesStore');
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'authentication required' }, { status: 401 });

    const result = await approveOffer(id, user.id);
    if (!result) return NextResponse.json({ error: 'not found or unauthorized' }, { status: 404 });

    return NextResponse.json({ status: 'ok', offer: result });
  } catch (err: any) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
