import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL, KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const POKEMON_API_KEY=process.env.POKEMON_API_KEY;
function admin(){return URL&&KEY?createClient(URL,KEY,{auth:{autoRefreshToken:false,persistSession:false}}):null}
function norm(v:string){return String(v||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
function cardLocalNumber(v:string){const first=String(v||"").split("/")[0].replace(/^0+/,"");return first||"0"}
async function resolveImage(a:any,p:any){
 if(!p||p.image_url||!p.card_name||!p.card_number)return p;
 const targetName=norm(p.card_name),targetSet=norm(p.card_set||""),number=cardLocalNumber(p.card_number);
 try{
   let image:string|null=null;
   if(POKEMON_API_KEY){
     const q=`number:${number}* name:${String(p.card_name).split(/\s+/)[0]}*`;
     const endpoint=new URL("https://api.pokemontcg.io/v2/cards");endpoint.searchParams.set("q",q);endpoint.searchParams.set("pageSize","100");
     const r=await fetch(endpoint.toString(),{headers:{"X-Api-Key":POKEMON_API_KEY,Accept:"application/json"},next:{revalidate:86400}});
     if(r.ok){const j=await r.json();const cards=Array.isArray(j.data)?j.data:[];const exact=cards.find((c:any)=>norm(c.name)===targetName&&String(c.number||"").replace(/^0+/,"")===number&&(!targetSet||norm(c.set?.name||"")===targetSet))||cards.find((c:any)=>norm(c.name)===targetName&&String(c.number||"").replace(/^0+/,"")===number);image=exact?.images?.large||exact?.images?.small||null;}
   }
   if(!image){
     const endpoint=new URL("https://api.tcgdex.net/v2/en/cards");endpoint.searchParams.set("name",`eq:${p.card_name}`);endpoint.searchParams.set("localId",`eq:${number}`);
     const r=await fetch(endpoint.toString(),{next:{revalidate:86400}});
     if(r.ok){const cards=await r.json();if(Array.isArray(cards)){for(const c of cards.slice(0,12)){try{const detail=await fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(c.id)}`,{next:{revalidate:86400}}).then(x=>x.ok?x.json():null);if(detail&&norm(detail.name)===targetName&&(!targetSet||norm(detail.set?.name||"")===targetSet)){image=detail.image?`${detail.image}/high.webp`:null;break;}}catch{}}if(!image){const c=cards.find((x:any)=>norm(x.name)===targetName);image=c?.image?`${c.image}/high.webp`:null;}}}
   }
   if(image){await a.from("welcome_rip_prizes").update({image_url:image}).eq("id",p.prize_id||p.id);return{...p,image_url:image};}
 }catch(e){console.error("Welcome Rip card image lookup failed",e)}
 return p;
}
async function ctx(r:Request){const a=admin();if(!a)return{a:null,u:null};const h=r.headers.get("authorization")||"";const t=h.startsWith("Bearer ")?h.slice(7):"";if(!t)return{a,u:null};const {data}=await a.auth.getUser(t);return{a,u:data.user||null}}
async function prize(a:any,id:string){const {data:c}=await a.from("welcome_rip_claims").select("prize_id,claimed_at").eq("user_id",id).maybeSingle();if(!c)return null;const {data:p}=await a.from("welcome_rip_prizes").select("*").eq("id",c.prize_id).maybeSingle();return p?resolveImage(a,{...p,claimed_at:c.claimed_at}):null}
async function info(a:any,id:string){const [{data:h},{count:r}]=await Promise.all([a.from("welcome_rip_households").select("user_id").eq("user_id",id).maybeSingle(),a.from("welcome_rip_prizes").select("id",{count:"exact",head:true}).is("claimed_by",null)]);return{addressVerified:!!h,remaining:r||0}}
export async function GET(r:Request){const{a,u}=await ctx(r);if(!a)return NextResponse.json({error:"Welcome Rip unavailable."},{status:503});if(!u)return NextResponse.json({error:"Authentication required."},{status:401});const [{data:s},p,i]=await Promise.all([a.from("welcome_rip_settings").select("launch_at,active").eq("singleton",true).maybeSingle(),prize(a,u.id),info(a,u.id)]);const eligible=!!(s?.active&&u.email_confirmed_at&&i.addressVerified&&(i.remaining>0||p));return NextResponse.json({active:!!s?.active,confirmed:!!u.email_confirmed_at,eligible,alreadyClaimed:!!p,prize:p,...i})}
export async function POST(r:Request){const{a,u}=await ctx(r);if(!a)return NextResponse.json({error:"Welcome Rip unavailable."},{status:503});if(!u)return NextResponse.json({error:"Authentication required."},{status:401});let body:any={};try{body=await r.json()}catch{}
 if(body?.address){const x=body.address;const vals=["shippingName","address1","city","region","postalCode","country"];if(vals.some(k=>!String(x[k]||"").trim()))return NextResponse.json({error:"Complete your shipping address first."},{status:400});const addr=[x.address1,x.address2,x.city,x.region,x.postalCode,x.country].map((v:any)=>String(v||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"")).join("|");const hash=createHash("sha256").update(addr).digest("hex");const {error}=await a.from("welcome_rip_households").insert({user_id:u.id,address_hash:hash,shipping_name:String(x.shippingName).trim(),address_line1:String(x.address1).trim(),address_line2:String(x.address2||"").trim()||null,city:String(x.city).trim(),region:String(x.region).trim(),postal_code:String(x.postalCode).trim(),country:String(x.country).trim().toUpperCase()});if(error){if(error.code==="23505")return NextResponse.json({error:"A Welcome Rip has already been registered for this household."},{status:409});return NextResponse.json({error:"We couldn't save that address."},{status:500});}return NextResponse.json({ok:true,addressVerified:true});}
 const {data,error}=await a.rpc("claim_welcome_rip",{target_user_id:u.id});if(error)return NextResponse.json({error:"We couldn't open your Welcome Rip."},{status:500});let p=Array.isArray(data)?data[0]:data;if(!p)return NextResponse.json({error:"Confirm your email and shipping address before opening your Welcome Rip."},{status:403});p=await resolveImage(a,p);const i=await info(a,u.id);return NextResponse.json({ok:true,prize:p,...i});}