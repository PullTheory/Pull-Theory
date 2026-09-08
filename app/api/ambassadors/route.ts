import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
function admin(){ if(!URL||!KEY) return null; return createClient(URL,KEY,{auth:{autoRefreshToken:false,persistSession:false}}); }
async function userFrom(req:Request){ const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,""); if(!token||!URL||!KEY)return null; const a=admin(); if(!a)return null; const {data}=await a.auth.getUser(token); return data.user||null; }
function cleanCode(v:string){return v.toUpperCase().replace(/[^A-Z0-9_-]/g,"").slice(0,24)}

export async function GET(req:Request){
 const a=admin(), user=await userFrom(req); if(!a||!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:code}=await a.from("referral_codes").select("id,code,active,created_at").eq("owner_user_id",user.id).maybeSingle();
 if(!code)return NextResponse.json({code:null,stats:{verified:0,paidMembers:0,earnedCents:0,paidCents:0,owedCents:0},referrals:[]});
 const {data:refs,error}=await a.from("referrals").select("id,status,signup_reward_cents,paid_member_bonus_cents,signup_reward_paid,paid_member_bonus_paid,created_at,confirmed_at,paid_member_at").eq("referral_code_id",code.id).order("created_at",{ascending:false});
 if(error)return NextResponse.json({error:"Unable to load referrals."},{status:500});
 const rows=refs||[]; let earned=0,paid=0,verified=0,paidMembers=0;
 for(const r of rows){ if(r.status==="confirmed"||r.status==="paid_member"){verified++;earned+=r.signup_reward_cents;if(r.signup_reward_paid)paid+=r.signup_reward_cents;} if(r.status==="paid_member"){paidMembers++;earned+=r.paid_member_bonus_cents;if(r.paid_member_bonus_paid)paid+=r.paid_member_bonus_cents;} }
 return NextResponse.json({code:code.code,stats:{verified,paidMembers,earnedCents:earned,paidCents:paid,owedCents:earned-paid},referrals:rows.map(r=>({id:r.id,status:r.status,createdAt:r.created_at}))});
}

export async function POST(req:Request){
 const a=admin(), user=await userFrom(req); if(!a||!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const body=await req.json().catch(()=>({})); const requested=cleanCode(String(body.code||user.user_metadata?.username||""));
 if(requested.length<3)return NextResponse.json({error:"Choose a code with at least 3 letters or numbers."},{status:400});
 const {data:existing}=await a.from("referral_codes").select("code").eq("owner_user_id",user.id).maybeSingle(); if(existing)return NextResponse.json({code:existing.code});
 const {data:conflict}=await a.from("referral_codes").select("id").ilike("code",requested).maybeSingle(); if(conflict)return NextResponse.json({error:"That referral code is already taken."},{status:409});
 const {data,error}=await a.from("referral_codes").insert({owner_user_id:user.id,code:requested}).select("code").single(); if(error)return NextResponse.json({error:"Unable to create referral code."},{status:500});
 return NextResponse.json({code:data.code});
}
