"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAccessToken, getSupabaseClient } from "../lib/supabase";

const events = [
 { slug:"weekly-themed-hunt", tag:"Weekly hunt", title:"Themed Card Hunt", prompt:"Pick a theme for this week—your favorite Pokémon type, an evolution line, a card artist, or a set. Share the card you’re hunting and why.", reward:"Participation spotlight", action:"Post your hunt" },
 { slug:"weekly-binder-showcase", tag:"Show & tell", title:"Binder Showcase", prompt:"Show one page, one favorite card, or a small part of your collection. Tell the community what makes it special.", reward:"Community feature", action:"Show your binder" },
 { slug:"weekly-trade-challenge", tag:"Trade challenge", title:"Good-Faith Trade Challenge", prompt:"Share a card you’d be happy to trade and what you’re hoping to find. Keep condition and expectations clear, and celebrate helpful, respectful trading.", reward:"Helpful collector spotlight", action:"Join the challenge" },
];
type Entry = { id:string; event_slug:string; entry_title:string; entry_text:string; card_image_url:string|null; is_public:boolean; completed:boolean; created_at:string; user_id:string };
export default function CommunityEventsPage() {
 const [entries,setEntries] = useState<Entry[]>([]);
 const [userId,setUserId] = useState<string|null>(null);
 const [loading,setLoading] = useState(true);
 const [message,setMessage] = useState("");
 const [active,setActive] = useState(events[0].slug);
 const [title,setTitle] = useState("");
 const [body,setBody] = useState("");
 const [image,setImage] = useState("");
 const [publicEntry,setPublicEntry] = useState(true);
 const [saving,setSaving] = useState(false);
 async function load() {
  const client = getSupabaseClient();
  if (!client) { setLoading(false); return; }
  const [{data:{user}}, {data,error}] = await Promise.all([
    client.auth.getUser(),
    client.from("community_event_entries").select("id,event_slug,entry_title,entry_text,card_image_url,is_public,completed,created_at,user_id").eq("is_public",true).order("created_at",{ascending:false}).limit(40)
  ]);
  setUserId(user?.id ?? null);
  if (!error && data) setEntries(data as Entry[]);
  setLoading(false);
 }
 useEffect(()=>{ void load(); },[]);
 async function submit(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); setMessage(""); setSaving(true);
  const token = await getCurrentAccessToken();
  if (!token || !userId) { setMessage("Sign in first, then you can post your event entry."); setSaving(false); return; }
  const client = getSupabaseClient();
  if (!client) { setMessage("Community posts are temporarily unavailable."); setSaving(false); return; }
  const {error} = await client.from("community_event_entries").insert({
    user_id:userId,event_slug:active,entry_title:title.trim(),entry_text:body.trim(),
    card_image_url:image.trim() || null,is_public:publicEntry,updated_at:new Date().toISOString()
  });
  if (error) setMessage("Could not save your entry. Please try again in a moment.");
  else { setMessage("Your entry is saved. Thanks for taking part!"); setTitle(""); setBody(""); setImage(""); await load(); }
  setSaving(false);
 }
 return <main className="mx-auto max-w-6xl px-4 py-10 text-zinc-100">
  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">The PullTheory community</p>
  <h1 className="mt-3 text-4xl font-black sm:text-5xl">Collect together. Come back for the next challenge.</h1>
  <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">Weekly hunts, binder show-and-tell, and good-faith trade challenges. We want to celebrate participation, helpfulness, and great collecting stories—not just sign-ups.</p>
  <div className="mt-8 grid gap-4 lg:grid-cols-3">{events.map((event)=><button key={event.slug} onClick={()=>setActive(event.slug)} className={`rounded-2xl border p-5 text-left transition ${active===event.slug?"border-violet-300/70 bg-violet-500/[0.12]":"border-white/10 bg-white/[0.035] hover:border-white/25"}`}>
    <span className="text-xs font-bold uppercase tracking-wider text-violet-300">{event.tag}</span><h2 className="mt-3 text-xl font-bold">{event.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-300">{event.prompt}</p><p className="mt-4 text-sm font-semibold text-amber-200">Recognition: {event.reward}</p><p className="mt-4 font-bold text-white">{event.action} →</p>
  </button>)}</div>
  <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
   <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
    <h2 className="text-2xl font-bold">Join this week</h2><p className="mt-2 text-sm text-zinc-400">Choose a challenge above, share a short entry, and decide whether it appears publicly.</p>
    <label className="mt-5 block text-sm font-semibold">Entry title<input required minLength={3} maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none focus:border-violet-300" placeholder="The Pikachu card I’m hunting"/></label>
    <label className="mt-4 block text-sm font-semibold">Your story<textarea required maxLength={1200} rows={4} value={body} onChange={e=>setBody(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none focus:border-violet-300" placeholder="What are you collecting, sharing, or hoping to trade?"/></label>
    <label className="mt-4 block text-sm font-semibold">Card image URL (optional)<input type="url" value={image} onChange={e=>setImage(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none focus:border-violet-300" placeholder="https://…"/></label>
    <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300"><input type="checkbox" checked={publicEntry} onChange={e=>setPublicEntry(e.target.checked)} className="mt-1 accent-violet-400"/> Show this entry in the public community feed</label>
    <button disabled={saving} className="mt-5 rounded-full bg-violet-500 px-5 py-3 font-bold disabled:opacity-50">{saving?"Saving…":"Submit entry"}</button>
    {message && <p role="status" className="mt-4 text-sm text-violet-200">{message}</p>}
    {!userId && !loading && <p className="mt-3 text-xs text-zinc-500">You can browse challenges now; sign in to publish an entry.</p>}
   </form>
   <div><div className="flex items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Community entries</h2><p className="mt-1 text-sm text-zinc-400">Public posts from collectors</p></div><span className="text-sm text-zinc-500">{entries.length} shown</span></div>
    {loading?<p className="mt-5 text-zinc-400">Loading community posts…</p>:entries.length===0?<div className="mt-4 rounded-2xl border border-dashed border-white/15 p-8 text-center"><p className="font-semibold">Be the first to share.</p><p className="mt-2 text-sm text-zinc-400">Your first hunt or binder story can start the community feed.</p></div>:<div className="mt-4 space-y-3">{entries.map(entry=><article key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-300">{events.find(e=>e.slug===entry.event_slug)?.title ?? "Collector entry"}</p><h3 className="mt-2 text-lg font-bold">{entry.entry_title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{entry.entry_text}</p>{entry.card_image_url&&<a href={entry.card_image_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-violet-200 underline">View card photo</a>}<p className="mt-3 text-xs text-zinc-500">{new Date(entry.created_at).toLocaleDateString()}</p>
    </article>)}</div>}
   </div>
  </section>
  <p className="mt-8 text-xs leading-5 text-zinc-500">Community recognition is not a guaranteed prize. Never post private contact details or shipping addresses. Trade outcomes and any rewards should be reviewed fairly and transparently.</p>
 </main>;
}
