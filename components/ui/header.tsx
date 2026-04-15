import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <div className="h-20 flex items-center justify-between border-b-4 border-black bg-[#22d3ee] px-6 shadow-[0_4px_0_0_rgba(0,0,0,1)] sticky top-0 z-50">
  {/* Logo / Title */}
  <h1 className="text-2xl font-black uppercase tracking-tighter text-black">
    Campus Connect
  </h1>

  {/* Navigation - No soft underlines, just bold blocks */}
  <nav className="hidden md:flex items-center gap-8">
    <Link 
      href="/lost-found" 
      className="text-sm font-black uppercase tracking-widest text-black hover:bg-white px-3 py-1 border-2 border-transparent hover:border-black transition-all"
    >
      Lost & Found
    </Link>
    
    <Link 
      href="/mess-complaint" 
      className="text-sm font-black uppercase tracking-widest text-black hover:bg-[#facc15] px-3 py-1 border-2 border-transparent hover:border-black transition-all"
    >
      Mess Complaint
    </Link>
  </nav>

  {/* Auth & Notification Logic */}
  <div className="flex items-center gap-4">

    <Button className="rounded-none bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all h-10 px-6">
      Login
    </Button>
  </div>
</div>
  );
}