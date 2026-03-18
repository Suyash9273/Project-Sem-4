import { ReportItemForm } from "@/components/ReportItemForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-8 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-black to-black">
      
      <div className="w-full max-w-lg mb-6 flex items-center">
        <Link href="/api/feed">
          <Button variant="ghost" className="text-zinc-400 hover:text-white pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Button>
        </Link>
      </div>

      <ReportItemForm />
      
    </main>
  )
}