import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/tradesStore";
import { isPullTheoryOperator } from "../../../lib/operator";
import { getMarketingAudienceCount, sendMemberAnnouncement } from "../../../lib/memberMarketing";

export const runtime = "nodejs";

async function operatorFor(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  const user = await getUserFromToken(token);
  return user && isPullTheoryOperator(user.email) ? user : null;
}

export async function GET(request: Request) {
  if (!(await operatorFor(request))) return NextResponse.json({ error: "PullShield Desk operator access required." }, { status: 403 });
  try { return NextResponse.json(await getMarketingAudienceCount()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load email audience." }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!(await operatorFor(request))) return NextResponse.json({ error: "PullShield Desk operator access required." }, { status: 403 });
  try {
    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject : "";
    const text = typeof body.text === "string" ? body.text : "";
    const html = typeof body.html === "string" ? body.html : undefined;
    return NextResponse.json(await sendMemberAnnouncement({ subject, text, html }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send member announcement." }, { status: 400 });
  }
}
