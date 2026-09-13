import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const URL=process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

export async function GET(){
  if(!URL||!KEY)return NextResponse.json({remaining:0,total:100},{status:503});
  const admin=createClient(URL,KEY,{auth:{autoRefreshToken:false,persistSession:false}});
  const [{count:remaining},{count:total}]=await Promise.all([
    admin.from("welcome_rip_prizes").select("id",{count:"exact",head:true}).is("claimed_by",null),
    admin.from("welcome_rip_prizes").select("id",{count:"exact",head:true})
  ]);
  return NextResponse.json({remaining:remaining??0,total:total??0},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
