import Link from "next/link";
import MemberAnnouncementPanel from "../../components/MemberAnnouncementPanel";
export default function PullShieldEmailPage() {
  return <main className="min-h-screen bg-[#050506] px-6 py-12 text-white"><div className="mx-auto max-w-4xl"><Link href="/pullshield" className="text-sm font-semibold text-violet-200">Back to PullShield Desk</Link><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Private operations</p><h1 className="mt-2 text-4xl font-semibold">Member announcements</h1><p className="mt-3 text-zinc-300">Send product announcements to eligible PullTheory members.</p></div><MemberAnnouncementPanel /></div></main>;
}
