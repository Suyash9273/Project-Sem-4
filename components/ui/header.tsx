import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <div className="flex h-20 items-center justify-between border-b px-6">
      <h1 className="text-2xl font-bold">Campus Connect</h1>

      <nav className="flex items-center gap-6">
        <Link href="/lost-found" className="group relative text-sm font-medium text-foreground">
          Lost & Found
          {/* The Marker */}
          <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <Link href="/mess-complaint" className="group relative text-sm font-medium text-foreground">
          Mess Complaint
          {/* The Marker */}
          <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
      </nav>

      <div className="flex gap-2">
        <Button>Login</Button>
      </div>
    </div>
  );
}