import {createClient} from "@supabase/supabase-js";
import {getUserFromToken} from "../../../lib/tradesStore";
import {isPullTheoryOperator} from "../../../lib/operator";
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const db=()=>URL&&KEY?createClient(URL,KEY,{auth:{autoRefreshToken:false,persistSession:false}}):null;
async function operator(req:Request){const h=req.headers.get("authorization")||"";const u=await getUserFromToken(h.startsWith("Bearer ")?h.slice(7):null);return u&&isPullTheoryOperator(u.email)?u:null}
export async function GET(req:Request){
  if(!await operator(req))return Response.json({error:"Operator access required."},{status:403});
  const a=db();if(!a)return Response.json({error:"Not configured."},{status:503});
  const {data:codes,error}=await a.from("referral_codes").select("id,code,owner_user_id,active,created_at").order("created_at",{ascending:false});
  if(error)return Response.json({error:error.message},{status:500});
  const {data:refs}=await a.from("referrals").select("*").order("created_at",{ascending:false});
  const rows=refs||[];
  const users=new Map<string,{email:string,username:string}>();
  let page=1;const perPage=1000;
  while(true){const {data,error:userError}=await a.auth.admin.listUsers({page,perPage});if(userError)break;for(const u of data.users){users.set(u.id,{email:u.email||"No email",username:(typeof u.user_metadata?.username==="string"&&u.user_metadata.username.trim())||"No username"});}if(data.users.length<perPage)break;page+=1;}
  const ambassadors=(codes||[]).map(c=>{const r=rows.filter(x=>x.referral_code_id===c.id);let earned=0,paid=0;for(const x of r){if(x.status==="confirmed"||x.status==="paid_member"){earned+=x.signup_reward_cents;if(x.signup_reward_paid)paid+=x.signup_reward_cents}if(x.status==="paid_member"){earned+=x.paid_member_bonus_cents;if(x.paid_member_bonus_paid)paid+=x.paid_member_bonus_cents}}const owner=users.get(c.owner_user_id);return {...c,username:owner?.username||"Unknown",email:owner?.email||"Unknown",verified:r.filter(x=>x.status==="confirmed"||x.status==="paid_member").length,paidMembers:r.filter(x=>x.status==="paid_member").length,earnedCents:earned,paidCents:paid,owedCents:earned-paid}});
  return Response.json({summary:{totalAmbassadors:ambassadors.length,activeAmbassadors:ambassadors.filter(a=>a.active).length,totalVerified:ambassadors.reduce((n,a)=>n+a.verified,0),totalPaidMembers:ambassadors.reduce((n,a)=>n+a.paidMembers,0),totalOwedCents:ambassadors.reduce((n,a)=>n+a.owedCents,0)},ambassadors,referrals:rows});
}
export async function PATCH(req:Request){if(!await operator(req))return Response.json({error:"Operator access required."},{status:403});const a=db();if(!a)return Response.json({error:"Not configured."},{status:503});const b=await req.json();const id=Number(b.id);if(!Number.isInteger(id))return Response.json({error:"Invalid referral."},{status:400});const patch:any={};if(b.action==="confirm")Object.assign(patch,{status:"confirmed",confirmed_at:new Date().toISOString()});else if(b.action==="paid_member")Object.assign(patch,{status:"paid_member",confirmed_at:new Date().toISOString(),paid_member_at:new Date().toISOString()});else if(b.action==="reject")patch.status="rejected";else if(b.action==="mark_paid")Object.assign(patch,{signup_reward_paid:true,paid_member_bonus_paid:true});else return Response.json({error:"Invalid action."},{status:400});const {error}=await a.from("referrals").update(patch).eq("id",id);if(error)return Response.json({error:error.message},{status:500});return Response.json({ok:true});}
